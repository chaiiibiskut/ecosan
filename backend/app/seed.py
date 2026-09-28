import random
from datetime import datetime, timedelta

from app.database import SessionLocal, init_db
from app.models import (
    Zone, Bin, BinReading, Vehicle, VehicleStatus,
    SanitationSite, SanitizationLog, Alert, Classification,
    Route, BinStatus, WasteType, AlertSeverity
)


NIT_ROURKELA_CENTER = (22.2604, 84.8536)

ZONES = [
    {"name": "Academic Zone A", "lat": 22.2620, "lng": 84.8550, "desc": "Main academic buildings"},
    {"name": "Academic Zone B", "lat": 22.2580, "lng": 84.8520, "desc": "Engineering departments"},
    {"name": "Hostel Zone North", "lat": 22.2650, "lng": 84.8580, "desc": "Boys hostels"},
    {"name": "Hostel Zone South", "lat": 22.2550, "lng": 84.8480, "desc": "Girls hostels"},
    {"name": "Residential Campus", "lat": 22.2680, "lng": 84.8600, "desc": "Staff quarters"},
    {"name": "Sports Complex", "lat": 22.2600, "lng": 84.8450, "desc": "Stadium and grounds"},
    {"name": "Admin & Library", "lat": 22.2590, "lng": 84.8510, "desc": "Admin block and central library"},
    {"name": "Market Area", "lat": 22.2560, "lng": 84.8490, "desc": "Campus market and canteens"},
]

VEHICLES_DATA = [
    {"code": "EV-01", "type": "Electric Compactor", "capacity": 6000, "lat": 22.2610, "lng": 84.8540, "driver": "Rajesh Kumar", "battery": 86},
    {"code": "EV-02", "type": "Electric Compactor", "capacity": 6000, "lat": 22.2570, "lng": 84.8500, "driver": "Suresh Patel", "battery": 64},
    {"code": "EV-03", "type": "Electric Recycler", "capacity": 4500, "lat": 22.2630, "lng": 84.8560, "driver": "Amit Singh", "battery": 92},
    {"code": "EV-04", "type": "Electric Recycler", "capacity": 4500, "lat": 22.2590, "lng": 84.8520, "driver": "Vikram Das", "battery": 78},
    {"code": "EV-05", "type": "Electric Hazardous", "capacity": 3000, "lat": 22.2640, "lng": 84.8570, "driver": "Mohan Lal", "battery": 88},
    {"code": "EV-06", "type": "Electric Sanitizer", "capacity": 2000, "lat": 22.2580, "lng": 84.8480, "driver": "Deepak Sharma", "battery": 71},
]

SANITATION_SITES = [
    {"name": "Main Gate Washroom", "lat": 22.2615, "lng": 84.8545, "type": "public_washroom", "supply": 500},
    {"name": "Academic Block A Washroom", "lat": 22.2622, "lng": 84.8552, "type": "public_washroom", "supply": 400},
    {"name": "Academic Block B Washroom", "lat": 22.2582, "lng": 84.8522, "type": "public_washroom", "supply": 400},
    {"name": "Central Library Washroom", "lat": 22.2592, "lng": 84.8512, "type": "public_washroom", "supply": 600},
    {"name": "Boys Hostel 1 Washroom", "lat": 22.2652, "lng": 84.8582, "type": "hostel_washroom", "supply": 800},
    {"name": "Boys Hostel 2 Washroom", "lat": 22.2655, "lng": 84.8585, "type": "hostel_washroom", "supply": 800},
    {"name": "Girls Hostel Washroom", "lat": 22.2552, "lng": 84.8482, "type": "hostel_washroom", "supply": 700},
    {"name": "Sports Complex Washroom", "lat": 22.2602, "lng": 84.8452, "type": "public_washroom", "supply": 300},
    {"name": "Market Area Washroom", "lat": 22.2562, "lng": 84.8492, "type": "public_washroom", "supply": 500},
    {"name": "Admin Block Washroom", "lat": 22.2590, "lng": 84.8510, "type": "public_washroom", "supply": 350},
    {"name": "Staff Quarters Washroom", "lat": 22.2682, "lng": 84.8602, "type": "residential_washroom", "supply": 450},
    {"name": "Canteen Washroom", "lat": 22.2570, "lng": 84.8500, "type": "public_washroom", "supply": 550},
]


def random_offset(lat: float, lng: float, radius_km: float = 0.5) -> tuple:
    lat_offset = random.uniform(-radius_km / 111, radius_km / 111)
    lng_offset = random.uniform(-radius_km / (111 * abs(lat)), radius_km / (111 * abs(lat)))
    return lat + lat_offset, lng + lng_offset


def seed():
    print("Initializing database...")
    init_db()
    
    db = SessionLocal()
    try:
        print("Checking existing data...")
        if db.query(Zone).first():
            print("Database already seeded. Skipping.")
            return
        
        print("Creating zones...")
        zones = []
        for z in ZONES:
            zone = Zone(
                name=z["name"],
                description=z["desc"],
                lat=z["lat"],
                lng=z["lng"],
                radius_km=0.8
            )
            db.add(zone)
            zones.append(zone)
        db.commit()
        for z in zones:
            db.refresh(z)
        
        print("Creating bins...")
        bins = []
        waste_types = list(WasteType)
        statuses = list(BinStatus)
        
        for i in range(40):
            zone = random.choice(zones)
            lat, lng = random_offset(zone.lat, zone.lng, 0.4)
            
            fill_pct = round(random.uniform(0, 95), 1)
            if fill_pct >= 90:
                status = BinStatus.CRITICAL
            elif fill_pct >= 75:
                status = BinStatus.HIGH
            elif fill_pct >= 50:
                status = BinStatus.MEDIUM
            elif fill_pct >= 25:
                status = BinStatus.LOW
            elif fill_pct > 0:
                status = BinStatus.EMPTY
            else:
                status = random.choice([BinStatus.EMPTY, BinStatus.OFFLINE])
            
            bin = Bin(
                zone_id=zone.id,
                bin_code=f"BIN-{str(i+1).zfill(3)}",
                lat=lat,
                lng=lng,
                fill_pct=fill_pct,
                status=status,
                waste_type=random.choice(waste_types),
                battery_pct=round(random.uniform(20, 100), 1),
                is_active=random.random() > 0.05
            )
            db.add(bin)
            bins.append(bin)
        db.commit()
        for b in bins:
            db.refresh(b)
        
        print("Creating bin readings...")
        for bin in bins:
            if not bin.is_active:
                continue
            for day in range(7):
                for hour in [6, 12, 18]:
                    timestamp = datetime.utcnow() - timedelta(days=day, hours=random.randint(0, 23))
                    base_fill = bin.fill_pct
                    variation = random.uniform(-10, 10)
                    reading_fill = max(0, min(100, base_fill + variation))
                    
                    reading = BinReading(
                        bin_id=bin.id,
                        fill_pct=round(reading_fill, 1),
                        weight_kg=round(random.uniform(0.5, 50), 1),
                        battery_pct=max(10, bin.battery_pct - random.uniform(0, 5)),
                        timestamp=timestamp
                    )
                    db.add(reading)
        db.commit()
        
        print("Creating vehicles...")
        vehicles = []
        for v in VEHICLES_DATA:
            vehicle = Vehicle(
                vehicle_code=v["code"],
                vehicle_type=v["type"],
                capacity_kg=v["capacity"],
                current_load_kg=round(random.uniform(0, v["capacity"] * 0.8), 1),
                battery_pct=v["battery"],
                status=random.choice([VehicleStatus.IDLE, VehicleStatus.EN_ROUTE, VehicleStatus.COLLECTING]),
                lat=v["lat"],
                lng=v["lng"],
                driver_name=v["driver"]
            )
            db.add(vehicle)
            vehicles.append(vehicle)
        db.commit()
        for v in vehicles:
            db.refresh(v)
        
        print("Creating sanitation sites...")
        sites = []
        for s in SANITATION_SITES:
            hours_ago = random.randint(1, 48)
            site = SanitationSite(
                name=s["name"],
                lat=s["lat"],
                lng=s["lng"],
                site_type=s["type"],
                last_sanitized_at=datetime.utcnow() - timedelta(hours=hours_ago),
                uv_c_status=random.random() > 0.2,
                mist_status=random.random() > 0.3,
                supply_liters=s["supply"] - random.uniform(0, s["supply"] * 0.6)
            )
            db.add(site)
            sites.append(site)
        db.commit()
        for s in sites:
            db.refresh(s)
        
        print("Creating sanitization logs...")
        for site in sites:
            for _ in range(random.randint(3, 8)):
                days_ago = random.randint(0, 7)
                log = SanitizationLog(
                    site_id=site.id,
                    action_type=random.choice(["uv_c", "mist", "uv_c_mist"]),
                    duration_seconds=random.randint(120, 600),
                    supply_used_liters=round(random.uniform(10, 100), 1),
                    performed_by=random.choice(["auto", "operator_1", "operator_2"]),
                    timestamp=datetime.utcnow() - timedelta(days=days_ago, hours=random.randint(0, 23))
                )
                db.add(log)
        db.commit()
        
        print("Creating classifications...")
        for bin in bins:
            if not bin.is_active:
                continue
            for _ in range(random.randint(5, 15)):
                waste_type, _, min_conf, max_conf = random.choice([
                    (WasteType.ORGANIC, "Food waste", 0.92, 0.98),
                    (WasteType.RECYCLABLE, "PET plastic", 0.88, 0.97),
                    (WasteType.RECYCLABLE, "Aluminum can", 0.85, 0.95),
                    (WasteType.HAZARDOUS, "Battery", 0.90, 0.99),
                    (WasteType.HAZARDOUS, "E-waste", 0.87, 0.96),
                    (WasteType.SANITARY, "Diaper", 0.82, 0.93),
                    (WasteType.MIXED, "Mixed waste", 0.70, 0.85),
                ])
                classification = Classification(
                    bin_id=bin.id,
                    waste_type=waste_type,
                    confidence=round(random.uniform(min_conf, max_conf), 2),
                    weight_kg=round(random.uniform(0.1, 5.0), 2),
                    model_version="EcoYOLO-v9-Edge",
                    timestamp=datetime.utcnow() - timedelta(
                        days=random.randint(0, 7),
                        hours=random.randint(0, 23),
                        minutes=random.randint(0, 59)
                    )
                )
                db.add(classification)
        db.commit()
        
        print("Creating alerts...")
        critical_bins = [b for b in bins if b.status == BinStatus.CRITICAL]
        for bin in critical_bins[:6]:
            alert = Alert(
                bin_id=bin.id,
                alert_type="bin_overflow",
                severity=AlertSeverity.CRITICAL,
                message=f"Bin {bin.bin_code} at {bin.fill_pct:.0f}% capacity - immediate collection required"
            )
            db.add(alert)
        
        high_bins = [b for b in bins if b.status == BinStatus.HIGH]
        for bin in high_bins[:8]:
            alert = Alert(
                bin_id=bin.id,
                alert_type="bin_high",
                severity=AlertSeverity.WARNING,
                message=f"Bin {bin.bin_code} at {bin.fill_pct:.0f}% capacity - schedule collection soon"
            )
            db.add(alert)
        
        offline_bins = [b for b in bins if b.status == BinStatus.OFFLINE]
        for bin in offline_bins:
            alert = Alert(
                bin_id=bin.id,
                alert_type="bin_offline",
                severity=AlertSeverity.WARNING,
                message=f"Bin {bin.bin_code} is offline - check connectivity"
            )
            db.add(alert)
        
        for site in sites[:3]:
            alert = Alert(
                bin_id=None,
                alert_type="sanitization_due",
                severity=AlertSeverity.WARNING,
                message=f"Sanitization overdue at {site.name} - last done 26 hours ago"
            )
            db.add(alert)
        
        db.commit()
        
        print("Creating routes...")
        for vehicle in vehicles[:4]:
            bins_to_collect = random.sample(
                [b for b in bins if b.status in [BinStatus.HIGH, BinStatus.CRITICAL] and b.is_active],
                k=min(5, len([b for b in bins if b.status in [BinStatus.HIGH, BinStatus.CRITICAL] and b.is_active]))
            )
            if not bins_to_collect:
                continue
            
            bin_ids = [b.id for b in bins_to_collect]
            total_distance = 0.0
            for i in range(len(bins_to_collect) - 1):
                lat1, lng1 = bins_to_collect[i].lat, bins_to_collect[i].lng
                lat2, lng2 = bins_to_collect[i + 1].lat, bins_to_collect[i + 1].lng
                total_distance += ((lat2 - lat1) ** 2 + (lng2 - lng1) ** 2) ** 0.5 * 111
            
            route = Route(
                vehicle_id=vehicle.id,
                bin_ids=str(bin_ids),
                status=random.choice(["planned", "in_progress", "completed"]),
                distance_km=round(total_distance, 2),
                estimated_time_min=int(total_distance * 2 + len(bins_to_collect) * 5),
                fuel_saved_kg=round(total_distance * 0.3, 2),
                started_at=datetime.utcnow() - timedelta(hours=random.randint(0, 4)) if random.random() > 0.3 else None,
                completed_at=datetime.utcnow() - timedelta(hours=random.randint(0, 2)) if random.random() > 0.7 else None
            )
            db.add(route)
        db.commit()
        
        print("\n[SUCCESS] Seed completed successfully!")
        print(f"   Zones: {len(zones)}")
        print(f"   Bins: {len(bins)}")
        print(f"   Vehicles: {len(vehicles)}")
        print(f"   Sanitation Sites: {len(sites)}")
        print(f"   Bin Readings: ~{len(bins) * 21}")
        print(f"   Classifications: ~{len(bins) * 10}")
        print(f"   Alerts: ~20")
        print(f"   Routes: ~4")
        
    except Exception as e:
        print(f"[ERROR] Error: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()