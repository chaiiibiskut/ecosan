from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.database import get_db
from app.models import Vehicle, Route, Bin, BinStatus, VehicleStatus
from app.schemas import VehicleResponse, VehicleCreate, VehicleUpdate, RouteResponse, RouteCreate, RouteOptimizeRequest
from app.services.route_optimizer import (
    Location, Vehicle as OptVehicle, optimize_route as optimize_multi_route,
    solve_vrp_ortools, compute_random_route_distance
)

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


@router.get("/routes", response_model=List[RouteResponse])
def list_routes(
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Route)
    if status:
        query = query.filter(Route.status == status)
    return query.order_by(Route.created_at.desc()).all()


@router.post("/routes/optimize", response_model=RouteResponse)
def optimize_route(request: RouteOptimizeRequest, db: Session = Depends(get_db)):
    vehicle = db.query(Vehicle).filter(Vehicle.id == request.vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    
    bins = db.query(Bin).filter(
        Bin.is_active == True,
        Bin.status.in_([BinStatus.HIGH, BinStatus.CRITICAL])
    ).order_by(Bin.fill_pct.desc()).limit(request.max_bins).all()
    
    if not bins:
        raise HTTPException(status_code=400, detail="No bins need collection")
    
    from app.services.route_optimizer import Location, Vehicle as OptVehicle, solve_vrp_ortools, compute_random_route_distance
    import math
    
    locations = [
        Location(id=b.id, lat=b.lat, lng=b.lng, fill_pct=b.fill_pct)
        for b in bins
    ]
    opt_vehicle = OptVehicle(
        id=vehicle.id,
        lat=vehicle.lat,
        lng=vehicle.lng,
        capacity_kg=vehicle.capacity_kg,
        current_load_kg=vehicle.current_load_kg
    )
    
    route_ids, optimized_distance = solve_vrp_ortools(
        locations, opt_vehicle, request.max_distance_km
    )
    
    random_distance = compute_random_route_distance(locations, opt_vehicle)
    distance_saved = max(0, random_distance - optimized_distance)
    
    estimated_time = int(optimized_distance * 2 + len(route_ids) * 5)
    fuel_saved = distance_saved * 0.3
    
    route = Route(
        vehicle_id=request.vehicle_id,
        bin_ids=str(route_ids),
        status="planned",
        distance_km=round(optimized_distance, 2),
        estimated_time_min=estimated_time,
        fuel_saved_kg=round(fuel_saved, 2)
    )
    db.add(route)
    
    vehicle.status = VehicleStatus.EN_ROUTE
    vehicle.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(route)
    return route


@router.post("/routes/optimize-all")
def optimize_all_routes(
    max_bins_per_vehicle: int = 10,
    max_distance_km: float = 50.0,
    db: Session = Depends(get_db)
):
    vehicles = db.query(Vehicle).filter(
        Vehicle.status.in_([VehicleStatus.IDLE, VehicleStatus.EN_ROUTE])
    ).all()
    
    bins = db.query(Bin).filter(
        Bin.is_active == True,
        Bin.status.in_([BinStatus.HIGH, BinStatus.CRITICAL])
    ).order_by(Bin.fill_pct.desc()).all()
    
    if not bins:
        raise HTTPException(status_code=400, detail="No bins need collection")
    if not vehicles:
        raise HTTPException(status_code=400, detail="No available vehicles")
    
    locations = [
        Location(id=b.id, lat=b.lat, lng=b.lng, fill_pct=b.fill_pct)
        for b in bins
    ]
    opt_vehicles = [
        OptVehicle(
            id=v.id,
            lat=v.lat,
            lng=v.lng,
            capacity_kg=v.capacity_kg,
            current_load_kg=v.current_load_kg
        )
        for v in vehicles
    ]
    
    results = optimize_multi_route(
        locations, opt_vehicles, max_bins_per_vehicle, max_distance_km
    )
    
    for result in results:
        route = Route(
            vehicle_id=result["vehicle_id"],
            bin_ids=str(result["bin_ids"]),
            status="planned",
            distance_km=result["optimized_distance_km"],
            estimated_time_min=int(result["optimized_distance_km"] * 2 + result["bins_count"] * 5),
            fuel_saved_kg=result["distance_saved_km"] * 0.3
        )
        db.add(route)
        
        vehicle = db.query(Vehicle).filter(Vehicle.id == result["vehicle_id"]).first()
        if vehicle:
            vehicle.status = VehicleStatus.EN_ROUTE
            vehicle.updated_at = datetime.utcnow()
    
    db.commit()
    
    return {
        "routes": results,
        "total_bins_assigned": sum(r["bins_count"] for r in results),
        "total_distance_saved_km": round(sum(r["distance_saved_km"] for r in results), 2),
        "total_optimized_distance_km": round(sum(r["optimized_distance_km"] for r in results), 2),
    }


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


@router.get("/{vehicle_id}", response_model=VehicleResponse)
def get_vehicle(vehicle_id: int, db: Session = Depends(get_db)):
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
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