from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta

from app.database import get_db
from app.models import Bin, BinReading, BinStatus, WasteType, Alert, AlertSeverity, Classification
from app.schemas import BinResponse, BinCreate, BinUpdate, BinReadingCreate, BinReadingResponse, KPIResponse
from app.api.analytics import compute_segregation_accuracy

router = APIRouter(prefix="/api/bins", tags=["bins"])


@router.get("", response_model=List[BinResponse])
def list_bins(
    zone_id: Optional[int] = None,
    status: Optional[BinStatus] = None,
    waste_type: Optional[WasteType] = None,
    active_only: bool = True,
    db: Session = Depends(get_db)
):
    query = db.query(Bin)
    if active_only:
        query = query.filter(Bin.is_active == True)
    if zone_id:
        query = query.filter(Bin.zone_id == zone_id)
    if status:
        query = query.filter(Bin.status == status)
    if waste_type:
        query = query.filter(Bin.waste_type == waste_type)
    return query.all()


@router.get("/kpis", response_model=KPIResponse)
def get_kpis(db: Session = Depends(get_db)):
    total_bins = db.query(Bin).filter(Bin.is_active == True).count()
    active_bins = db.query(Bin).filter(Bin.is_active == True, Bin.status != BinStatus.OFFLINE).count()
    critical_bins = db.query(Bin).filter(Bin.status == BinStatus.CRITICAL).count()
    
    from app.models import Vehicle, VehicleStatus, SanitationSite
    total_vehicles = db.query(Vehicle).count()
    active_vehicles = db.query(Vehicle).filter(Vehicle.status != VehicleStatus.MAINTENANCE).count()
    total_sites = db.query(SanitationSite).filter(SanitationSite.is_active == True).count()
    
    avg_fill = db.query(Bin.fill_pct).filter(Bin.is_active == True).all()
    avg_fill_pct = sum([a[0] for a in avg_fill]) / len(avg_fill) if avg_fill else 0
    
    today = datetime.utcnow().date()
    today_readings = db.query(BinReading).filter(
        BinReading.timestamp >= today
    ).all()
    total_waste = sum([r.weight_kg or 0 for r in today_readings])
    
    segregation_accuracy, _ = compute_segregation_accuracy(db)
    
    sanitization_index = 89.0
    
    return KPIResponse(
        total_bins=total_bins,
        active_bins=active_bins,
        critical_bins=critical_bins,
        total_vehicles=total_vehicles,
        active_vehicles=active_vehicles,
        total_sites=total_sites,
        avg_fill_pct=round(avg_fill_pct, 1),
        total_waste_today_kg=round(total_waste, 1),
        segregation_accuracy=segregation_accuracy,
        sanitization_index=sanitization_index
    )


@router.get("/{bin_id}", response_model=BinResponse)
def get_bin(bin_id: int, db: Session = Depends(get_db)):
    bin = db.query(Bin).filter(Bin.id == bin_id).first()
    if not bin:
        raise HTTPException(status_code=404, detail="Bin not found")
    return bin


@router.post("", response_model=BinResponse, status_code=201)
def create_bin(bin_data: BinCreate, db: Session = Depends(get_db)):
    existing = db.query(Bin).filter(Bin.bin_code == bin_data.bin_code).first()
    if existing:
        raise HTTPException(status_code=400, detail="Bin code already exists")
    
    bin = Bin(**bin_data.model_dump())
    db.add(bin)
    db.commit()
    db.refresh(bin)
    return bin


@router.patch("/{bin_id}", response_model=BinResponse)
def update_bin(bin_id: int, bin_data: BinUpdate, db: Session = Depends(get_db)):
    bin = db.query(Bin).filter(Bin.id == bin_id).first()
    if not bin:
        raise HTTPException(status_code=404, detail="Bin not found")
    
    update_data = bin_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(bin, field, value)
    
    bin.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(bin)
    return bin


def _create_alert_if_needed(bin_obj: Bin, fill_pct: float, gas_ppm: float | None, db: Session):
    # Check for existing unresolved alerts for this bin
    existing_overflow = db.query(Alert).filter(
        Alert.bin_id == bin_obj.id,
        Alert.alert_type == "bin_overflow",
        Alert.is_resolved == False
    ).first()
    
    existing_high = db.query(Alert).filter(
        Alert.bin_id == bin_obj.id,
        Alert.alert_type == "bin_high",
        Alert.is_resolved == False
    ).first()
    
    existing_gas = db.query(Alert).filter(
        Alert.bin_id == bin_obj.id,
        Alert.alert_type == "gas_spike",
        Alert.is_resolved == False
    ).first()
    
    if fill_pct >= 85 and not existing_overflow:
        alert = Alert(
            bin_id=bin_obj.id,
            alert_type="bin_overflow",
            severity=AlertSeverity.CRITICAL,
            message=f"Bin {bin_obj.bin_code} at {fill_pct:.0f}% capacity - immediate collection required"
        )
        db.add(alert)
    elif fill_pct >= 75 and fill_pct < 85 and not existing_high:
        alert = Alert(
            bin_id=bin_obj.id,
            alert_type="bin_high",
            severity=AlertSeverity.WARNING,
            message=f"Bin {bin_obj.bin_code} at {fill_pct:.0f}% capacity - schedule collection soon"
        )
        db.add(alert)
    
    # Gas spike alert - trigger above 1000 ppm (sensible threshold for methane)
    if gas_ppm is not None and gas_ppm > 1000 and not existing_gas:
        alert = Alert(
            bin_id=bin_obj.id,
            alert_type="gas_spike",
            severity=AlertSeverity.CRITICAL,
            message=f"Bin {bin_obj.bin_code} gas spike detected: {gas_ppm:.0f} ppm - potential methane hazard"
        )
        db.add(alert)


def _resolve_alerts_on_collection(bin_obj: Bin, db: Session):
    """Resolve all open alerts for a bin when it's collected (fill_pct drops below 20)."""
    open_alerts = db.query(Alert).filter(
        Alert.bin_id == bin_obj.id,
        Alert.is_resolved == False
    ).all()
    
    for alert in open_alerts:
        alert.is_resolved = True
        alert.resolved_at = datetime.utcnow()
        alert.resolved_by = "system"


@router.post("/{bin_id}/fill", response_model=BinReadingResponse)
def record_fill(bin_id: int, reading: BinReadingCreate, db: Session = Depends(get_db)):
    bin = db.query(Bin).filter(Bin.id == bin_id).first()
    if not bin:
        raise HTTPException(status_code=404, detail="Bin not found")
    
    # Check if this is a collection event (fill_pct dropped below 20)
    was_high_fill = bin.fill_pct >= 20
    is_now_low_fill = reading.fill_pct < 20
    
    bin_reading = BinReading(
        bin_id=bin_id,
        fill_pct=reading.fill_pct,
        weight_kg=reading.weight_kg,
        battery_pct=reading.battery_pct,
        gas_ppm=reading.gas_ppm
    )
    db.add(bin_reading)
    
    bin.fill_pct = reading.fill_pct
    if reading.battery_pct is not None:
        bin.battery_pct = reading.battery_pct
    
    if reading.fill_pct >= 90:
        bin.status = BinStatus.CRITICAL
    elif reading.fill_pct >= 75:
        bin.status = BinStatus.HIGH
    elif reading.fill_pct >= 50:
        bin.status = BinStatus.MEDIUM
    elif reading.fill_pct >= 25:
        bin.status = BinStatus.LOW
    else:
        bin.status = BinStatus.EMPTY
    
    # If fill dropped from >=20 to <20, treat as collection and resolve alerts
    if was_high_fill and is_now_low_fill:
        _resolve_alerts_on_collection(bin, db)
    else:
        _create_alert_if_needed(bin, reading.fill_pct, reading.gas_ppm, db)
    
    bin.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(bin_reading)
    return bin_reading


@router.post("/{bin_id}/reading", response_model=BinReadingResponse)
def record_reading(bin_id: int, reading: BinReadingCreate, db: Session = Depends(get_db)):
    return record_fill(bin_id, reading, db)


@router.get("/{bin_id}/readings", response_model=List[BinReadingResponse])
def get_bin_readings(
    bin_id: int,
    limit: int = Query(100, le=1000),
    hours: int = Query(24, le=168),
    db: Session = Depends(get_db)
):
    bin = db.query(Bin).filter(Bin.id == bin_id).first()
    if not bin:
        raise HTTPException(status_code=404, detail="Bin not found")
    
    since = datetime.utcnow() - timedelta(hours=hours)
    readings = db.query(BinReading).filter(
        BinReading.bin_id == bin_id,
        BinReading.timestamp >= since
    ).order_by(BinReading.timestamp.desc()).limit(limit).all()
    return readings


@router.post("/{bin_id}/collect", response_model=BinResponse)
def collect_bin(bin_id: int, db: Session = Depends(get_db)):
    bin = db.query(Bin).filter(Bin.id == bin_id).first()
    if not bin:
        raise HTTPException(status_code=404, detail="Bin not found")
    
    bin.fill_pct = 0.0
    bin.status = BinStatus.EMPTY
    bin.last_emptied_at = datetime.utcnow()
    bin.updated_at = datetime.utcnow()
    
    open_alerts = db.query(Alert).filter(
        Alert.bin_id == bin_id,
        Alert.is_resolved == False
    ).all()
    
    for alert in open_alerts:
        alert.is_resolved = True
        alert.resolved_at = datetime.utcnow()
        alert.resolved_by = "system"
    
    db.commit()
    db.refresh(bin)
    return bin