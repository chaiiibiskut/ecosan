from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from datetime import datetime, timedelta

from app.database import get_db
from app.models import Bin, BinReading, Classification, Vehicle, SanitationSite, WasteType, Route
from app.schemas import KPIResponse

router = APIRouter(prefix="/api/analytics", tags=["analytics"])


def compute_segregation_accuracy(db: Session) -> tuple:
    """Compute segregation accuracy from verified classifications.
    Returns (accuracy, note) where accuracy is float or None, note is str or None."""
    verified = db.query(Classification).filter(Classification.verified_category.isnot(None)).all()
    
    if len(verified) < 20:
        return None, "No verified data yet"
    
    correct = sum(1 for c in verified if c.waste_type == c.verified_category)
    accuracy = round((correct / len(verified)) * 100, 1)
    return accuracy, None


@router.get("/kpis", response_model=KPIResponse)
def get_kpis(db: Session = Depends(get_db)):
    total_bins = db.query(Bin).filter(Bin.is_active == True).count()
    active_bins = db.query(Bin).filter(Bin.is_active == True, Bin.status != "offline").count()
    critical_bins = db.query(Bin).filter(Bin.status == "critical").count()
    
    total_vehicles = db.query(Vehicle).count()
    active_vehicles = db.query(Vehicle).filter(Vehicle.status != "maintenance").count()
    total_sites = db.query(SanitationSite).filter(SanitationSite.is_active == True).count()
    
    avg_fill_result = db.query(func.avg(Bin.fill_pct)).filter(Bin.is_active == True).scalar()
    avg_fill_pct = round(avg_fill_result or 0, 1)
    
    today = datetime.utcnow().date()
    today_readings = db.query(BinReading).filter(
        func.date(BinReading.timestamp) == today
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
        avg_fill_pct=avg_fill_pct,
        total_waste_today_kg=round(total_waste, 1),
        segregation_accuracy=segregation_accuracy,
        sanitization_index=sanitization_index
    )


@router.get("/waste-trends")
def get_waste_trends(
    days: int = Query(7, le=30),
    db: Session = Depends(get_db)
):
    since = datetime.utcnow() - timedelta(days=days)
    
    readings = db.query(
        func.date(BinReading.timestamp).label("date"),
        func.sum(BinReading.weight_kg).label("total_kg"),
        func.count(BinReading.id).label("readings_count")
    ).filter(
        BinReading.timestamp >= since,
        BinReading.weight_kg.isnot(None)
    ).group_by(func.date(BinReading.timestamp)).all()
    
    return [
        {
            "date": str(r.date),
            "total_kg": round(r.total_kg or 0, 1),
            "readings_count": r.readings_count
        }
        for r in readings
    ]


@router.get("/segregation-trends")
def get_segregation_trends(
    days: int = Query(7, le=30),
    db: Session = Depends(get_db)
):
    since = datetime.utcnow() - timedelta(days=days)
    
    results = db.query(
        func.date(Classification.timestamp).label("date"),
        Classification.waste_type,
        func.count(Classification.id).label("count"),
        func.avg(Classification.confidence).label("avg_confidence")
    ).filter(
        Classification.timestamp >= since
    ).group_by(
        func.date(Classification.timestamp),
        Classification.waste_type
    ).all()
    
    data = {}
    for r in results:
        date_str = str(r.date)
        if date_str not in data:
            data[date_str] = {}
        data[date_str][r.waste_type.value] = {
            "count": r.count,
            "avg_confidence": round(r.avg_confidence or 0, 2)
        }
    
    return [
        {"date": date, **types}
        for date, types in sorted(data.items())
    ]


@router.get("/vehicle-efficiency")
def get_vehicle_efficiency(db: Session = Depends(get_db)):
    vehicles = db.query(Vehicle).all()
    
    result = []
    for v in vehicles:
        routes = db.query(Route).filter(Route.vehicle_id == v.id).all()
        total_distance = sum(r.distance_km for r in routes)
        total_fuel_saved = sum(r.fuel_saved_kg for r in routes)
        completed_routes = len([r for r in routes if r.status == "completed"])
        
        result.append({
            "vehicle_id": v.id,
            "vehicle_code": v.vehicle_code,
            "vehicle_type": v.vehicle_type,
            "total_routes": len(routes),
            "completed_routes": completed_routes,
            "total_distance_km": round(total_distance, 1),
            "total_fuel_saved_kg": round(total_fuel_saved, 1),
            "current_battery_pct": v.battery_pct,
            "current_status": v.status.value
        })
    
    return result


@router.get("/bin-fill-distribution")
def get_bin_fill_distribution(db: Session = Depends(get_db)):
    bins = db.query(Bin).filter(Bin.is_active == True).all()
    
    distribution = {
        "empty": 0,
        "low": 0,
        "medium": 0,
        "high": 0,
        "critical": 0,
        "offline": 0
    }
    
    for bin in bins:
        distribution[bin.status.value] = distribution.get(bin.status.value, 0) + 1
    
    return [
        {"status": k, "count": v}
        for k, v in distribution.items()
    ]


@router.get("/waste-type-breakdown")
def get_waste_type_breakdown(db: Session = Depends(get_db)):
    today = datetime.utcnow().date()
    
    results = db.query(
        Classification.waste_type,
        func.sum(Classification.weight_kg).label("total_kg"),
        func.count(Classification.id).label("count")
    ).filter(
        func.date(Classification.timestamp) == today,
        Classification.weight_kg.isnot(None)
    ).group_by(Classification.waste_type).all()
    
    total = sum(r.total_kg or 0 for r in results)
    
    return [
        {
            "waste_type": r.waste_type.value,
            "total_kg": round(r.total_kg or 0, 1),
            "count": r.count,
            "percentage": round((r.total_kg or 0) / total * 100, 1) if total > 0 else 0
        }
        for r in results
    ]


@router.get("/sanitization-coverage")
def get_sanitization_coverage(db: Session = Depends(get_db)):
    sites = db.query(SanitationSite).filter(SanitationSite.is_active == True).all()
    
    result = []
    for site in sites:
        hours_since = None
        if site.last_sanitized_at:
            hours_since = (datetime.utcnow() - site.last_sanitized_at).total_seconds() / 3600
        
        result.append({
            "site_id": site.id,
            "name": site.name,
            "site_type": site.site_type,
            "lat": site.lat,
            "lng": site.lng,
            "last_sanitized_hours_ago": round(hours_since, 1) if hours_since else None,
            "uv_c_status": site.uv_c_status,
            "mist_status": site.mist_status,
            "supply_liters": site.supply_liters,
            "needs_attention": hours_since is None or hours_since > 24 or site.supply_liters < 100
        })
    
    return result