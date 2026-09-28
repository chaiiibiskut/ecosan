from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta

from app.database import get_db
from app.models import Bin, BinReading, BinStatus, WasteType
from app.schemas import BinResponse, BinCreate, BinUpdate, BinReadingCreate, BinReadingResponse, KPIResponse

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
    
    from app.models import Vehicle, VehicleStatus, SanitationSite, Classification
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
    
    classifications = db.query(Classification).filter(
        Classification.timestamp >= today
    ).all()
    correct = sum([1 for c in classifications if c.confidence > 0.8])
    segregation_accuracy = (correct / len(classifications) * 100) if classifications else 94.8
    
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
        segregation_accuracy=round(segregation_accuracy, 1),
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


@router.post("/{bin_id}/fill", response_model=BinReadingResponse)
def record_fill(bin_id: int, reading: BinReadingCreate, db: Session = Depends(get_db)):
    bin = db.query(Bin).filter(Bin.id == bin_id).first()
    if not bin:
        raise HTTPException(status_code=404, detail="Bin not found")
    
    bin_reading = BinReading(
        bin_id=bin_id,
        fill_pct=reading.fill_pct,
        weight_kg=reading.weight_kg,
        battery_pct=reading.battery_pct
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
    
    bin.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(bin_reading)
    return bin_reading


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