from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.database import get_db
from app.models import Vehicle, Route, VehicleStatus
from app.schemas import VehicleResponse, VehicleCreate, VehicleUpdate, RouteResponse, RouteCreate, RouteOptimizeRequest

router = APIRouter(prefix="/api/vehicles", tags=["vehicles"])


@router.get("", response_model=List[VehicleResponse])
def list_vehicles(
    status: Optional[VehicleStatus] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Vehicle)
    if status:
        query = query.filter(Vehicle.status == status)
    return query.all()


@router.get("/{vehicle_id}", response_model=VehicleResponse)
def get_vehicle(vehicle_id: int, db: Session = Depends(get_db)):
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return vehicle


@router.post("", response_model=VehicleResponse, status_code=201)
def create_vehicle(vehicle_data: VehicleCreate, db: Session = Depends(get_db)):
    existing = db.query(Vehicle).filter(Vehicle.vehicle_code == vehicle_data.vehicle_code).first()
    if existing:
        raise HTTPException(status_code=400, detail="Vehicle code already exists")
    
    vehicle = Vehicle(**vehicle_data.model_dump())
    db.add(vehicle)
    db.commit()
    db.refresh(vehicle)
    return vehicle


@router.patch("/{vehicle_id}", response_model=VehicleResponse)
def update_vehicle(vehicle_id: int, vehicle_data: VehicleUpdate, db: Session = Depends(get_db)):
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    
    update_data = vehicle_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(vehicle, field, value)
    
    vehicle.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(vehicle)
    return vehicle


@router.get("/{vehicle_id}/routes", response_model=List[RouteResponse])
def get_vehicle_routes(vehicle_id: int, db: Session = Depends(get_db)):
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return vehicle.routes


@router.post("/routes/optimize", response_model=RouteResponse)
def optimize_route(request: RouteOptimizeRequest, db: Session = Depends(get_db)):
    vehicle = db.query(Vehicle).filter(Vehicle.id == request.vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    
    from app.models import Bin, BinStatus
    bins = db.query(Bin).filter(
        Bin.is_active == True,
        Bin.status.in_([BinStatus.HIGH, BinStatus.CRITICAL])
    ).order_by(Bin.fill_pct.desc()).limit(request.max_bins).all()
    
    if not bins:
        raise HTTPException(status_code=400, detail="No bins need collection")
    
    bin_ids = [b.id for b in bins]
    
    total_distance = 0.0
    for i in range(len(bins) - 1):
        lat1, lng1 = bins[i].lat, bins[i].lng
        lat2, lng2 = bins[i + 1].lat, bins[i + 1].lng
        total_distance += ((lat2 - lat1) ** 2 + (lng2 - lng1) ** 2) ** 0.5 * 111
    
    estimated_time = int(total_distance * 2 + len(bins) * 5)
    fuel_saved = total_distance * 0.3
    
    route = Route(
        vehicle_id=request.vehicle_id,
        bin_ids=str(bin_ids),
        status="planned",
        distance_km=round(total_distance, 2),
        estimated_time_min=estimated_time,
        fuel_saved_kg=round(fuel_saved, 2)
    )
    db.add(route)
    
    vehicle.status = VehicleStatus.EN_ROUTE
    vehicle.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(route)
    return route


@router.post("/routes", response_model=RouteResponse, status_code=201)
def create_route(route_data: RouteCreate, db: Session = Depends(get_db)):
    vehicle = db.query(Vehicle).filter(Vehicle.id == route_data.vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    
    route = Route(
        vehicle_id=route_data.vehicle_id,
        bin_ids=str(route_data.bin_ids),
        status="planned"
    )
    db.add(route)
    db.commit()
    db.refresh(route)
    return route