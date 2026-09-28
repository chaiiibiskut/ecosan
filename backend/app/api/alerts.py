from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.database import get_db
from app.models import Alert, Bin, AlertSeverity
from app.schemas import AlertResponse, AlertCreate, AlertUpdate

router = APIRouter(prefix="/api/alerts", tags=["alerts"])


@router.get("", response_model=List[AlertResponse])
def list_alerts(
    severity: Optional[AlertSeverity] = None,
    resolved: Optional[bool] = None,
    bin_id: Optional[int] = None,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    query = db.query(Alert)
    if severity:
        query = query.filter(Alert.severity == severity)
    if resolved is not None:
        query = query.filter(Alert.is_resolved == resolved)
    if bin_id:
        query = query.filter(Alert.bin_id == bin_id)
    return query.order_by(Alert.created_at.desc()).limit(limit).all()


@router.get("/{alert_id}", response_model=AlertResponse)
def get_alert(alert_id: int, db: Session = Depends(get_db)):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    return alert


@router.post("", response_model=AlertResponse, status_code=201)
def create_alert(alert_data: AlertCreate, db: Session = Depends(get_db)):
    if alert_data.bin_id:
        bin = db.query(Bin).filter(Bin.id == alert_data.bin_id).first()
        if not bin:
            raise HTTPException(status_code=404, detail="Bin not found")
    
    alert = Alert(**alert_data.model_dump())
    db.add(alert)
    db.commit()
    db.refresh(alert)
    return alert


@router.patch("/{alert_id}", response_model=AlertResponse)
def update_alert(alert_id: int, alert_data: AlertUpdate, db: Session = Depends(get_db)):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    update_data = alert_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(alert, field, value)
    
    if alert_data.is_resolved and not alert.is_resolved:
        alert.resolved_at = datetime.utcnow()
    
    db.commit()
    db.refresh(alert)
    return alert


@router.post("/check", response_model=List[AlertResponse])
def check_and_create_alerts(db: Session = Depends(get_db)):
    from app.models import Bin, BinStatus, SanitationSite
    
    new_alerts = []
    
    critical_bins = db.query(Bin).filter(
        Bin.is_active == True,
        Bin.status == BinStatus.CRITICAL
    ).all()
    
    for bin in critical_bins:
        existing = db.query(Alert).filter(
            Alert.bin_id == bin.id,
            Alert.alert_type == "bin_overflow",
            Alert.is_resolved == False
        ).first()
        
        if not existing:
            alert = Alert(
                bin_id=bin.id,
                alert_type="bin_overflow",
                severity=AlertSeverity.CRITICAL,
                message=f"Bin {bin.bin_code} at {bin.fill_pct:.0f}% capacity - immediate collection required"
            )
            db.add(alert)
            new_alerts.append(alert)
    
    high_bins = db.query(Bin).filter(
        Bin.is_active == True,
        Bin.status == BinStatus.HIGH
    ).all()
    
    for bin in high_bins:
        existing = db.query(Alert).filter(
            Alert.bin_id == bin.id,
            Alert.alert_type == "bin_high",
            Alert.is_resolved == False
        ).first()
        
        if not existing:
            alert = Alert(
                bin_id=bin.id,
                alert_type="bin_high",
                severity=AlertSeverity.WARNING,
                message=f"Bin {bin.bin_code} at {bin.fill_pct:.0f}% capacity - schedule collection soon"
            )
            db.add(alert)
            new_alerts.append(alert)
    
    offline_bins = db.query(Bin).filter(
        Bin.is_active == True,
        Bin.status == BinStatus.OFFLINE
    ).all()
    
    for bin in offline_bins:
        existing = db.query(Alert).filter(
            Alert.bin_id == bin.id,
            Alert.alert_type == "bin_offline",
            Alert.is_resolved == False
        ).first()
        
        if not existing:
            alert = Alert(
                bin_id=bin.id,
                alert_type="bin_offline",
                severity=AlertSeverity.WARNING,
                message=f"Bin {bin.bin_code} is offline - check connectivity"
            )
            db.add(alert)
            new_alerts.append(alert)
    
    sites_due = db.query(SanitationSite).filter(
        SanitationSite.is_active == True,
        SanitationSite.last_sanitized_at.isnot(None)
    ).all()
    
    for site in sites_due:
        if site.last_sanitized_at:
            hours_since = (datetime.utcnow() - site.last_sanitized_at).total_seconds() / 3600
            if hours_since > 24:
                existing = db.query(Alert).filter(
                    Alert.bin_id == None,
                    Alert.alert_type == "sanitization_due",
                    Alert.message.contains(site.name),
                    Alert.is_resolved == False
                ).first()
                
                if not existing:
                    alert = Alert(
                        bin_id=None,
                        alert_type="sanitization_due",
                        severity=AlertSeverity.WARNING,
                        message=f"Sanitization overdue at {site.name} - last done {int(hours_since)} hours ago"
                    )
                    db.add(alert)
                    new_alerts.append(alert)
    
    db.commit()
    for alert in new_alerts:
        db.refresh(alert)
    
    return new_alerts