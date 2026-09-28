from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta

from app.database import get_db
from app.models import Bin, BinReading, Vehicle, SanitationSite, Alert, Classification, Route, BinStatus, VehicleStatus
from app.schemas import KPIResponse
from app.api.analytics import compute_segregation_accuracy

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("/summary")
def get_dashboard_summary(db: Session = Depends(get_db)):
    total_bins = db.query(Bin).filter(Bin.is_active == True).count()
    active_bins = db.query(Bin).filter(Bin.is_active == True, Bin.status != BinStatus.OFFLINE).count()
    critical_bins = db.query(Bin).filter(Bin.status == BinStatus.CRITICAL).count()
    high_bins = db.query(Bin).filter(Bin.status == BinStatus.HIGH).count()
    
    total_vehicles = db.query(Vehicle).count()
    active_vehicles = db.query(Vehicle).filter(Vehicle.status != VehicleStatus.MAINTENANCE).count()
    en_route_vehicles = db.query(Vehicle).filter(Vehicle.status == VehicleStatus.EN_ROUTE).count()
    
    total_sites = db.query(SanitationSite).filter(SanitationSite.is_active == True).count()
    cutoff_time = datetime.utcnow() - timedelta(hours=24)
    sites_needing_attention = db.query(SanitationSite).filter(
        SanitationSite.is_active == True,
        (SanitationSite.supply_liters < 100) | 
        (SanitationSite.last_sanitized_at.is_(None)) | 
        (SanitationSite.last_sanitized_at < cutoff_time)
    ).count()
    
    avg_fill_result = db.query(func.avg(Bin.fill_pct)).filter(Bin.is_active == True).scalar()
    avg_fill_pct = round(avg_fill_result or 0, 1)
    
    today = datetime.utcnow().date()
    today_readings = db.query(BinReading).filter(
        func.date(BinReading.timestamp) == today
    ).all()
    total_waste = sum([r.weight_kg or 0 for r in today_readings])
    
    segregation_accuracy, segregation_accuracy_note = compute_segregation_accuracy(db)
    
    active_alerts = db.query(Alert).filter(Alert.is_resolved == False).count()
    critical_alerts = db.query(Alert).filter(Alert.is_resolved == False, Alert.severity == "critical").count()
    
    completed_routes_today = db.query(Route).filter(
        func.date(Route.completed_at) == today,
        Route.status == "completed"
    ).count() if db.query(Route).filter(Route.completed_at.isnot(None)).first() else 0
    
    sanitization_index = 89.0
    
    result = {
        "bins": {
            "total": total_bins,
            "active": active_bins,
            "critical": critical_bins,
            "high": high_bins,
            "avg_fill_pct": avg_fill_pct
        },
        "vehicles": {
            "total": total_vehicles,
            "active": active_vehicles,
            "en_route": en_route_vehicles
        },
        "sanitization": {
            "total_sites": total_sites,
            "needing_attention": sites_needing_attention,
            "sanitization_index": sanitization_index
        },
        "alerts": {
            "active": active_alerts,
            "critical": critical_alerts
        },
        "operations": {
            "total_waste_today_kg": round(total_waste, 1),
            "segregation_accuracy": segregation_accuracy,
            "completed_routes_today": completed_routes_today
        },
        "timestamp": datetime.utcnow().isoformat()
    }
    
    if segregation_accuracy_note:
        result["operations"]["segregation_accuracy_note"] = segregation_accuracy_note
    
    return result