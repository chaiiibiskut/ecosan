from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum, Text, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime
import enum

from app.database import Base


class BinStatus(str, enum.Enum):
    EMPTY = "empty"
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"
    OFFLINE = "offline"


class WasteType(str, enum.Enum):
    ORGANIC = "organic"
    RECYCLABLE = "recyclable"
    HAZARDOUS = "hazardous"
    SANITARY = "sanitary"
    MIXED = "mixed"


class VehicleStatus(str, enum.Enum):
    IDLE = "idle"
    EN_ROUTE = "en_route"
    COLLECTING = "collecting"
    RETURNING = "returning"
    MAINTENANCE = "maintenance"


class AlertSeverity(str, enum.Enum):
    INFO = "info"
    WARNING = "warning"
    CRITICAL = "critical"


class Zone(Base):
    __tablename__ = "zones"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, index=True, nullable=False)
    description = Column(Text, nullable=True)
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)
    radius_km = Column(Float, default=1.0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    bins = relationship("Bin", back_populates="zone")


class Bin(Base):
    __tablename__ = "bins"

    id = Column(Integer, primary_key=True, index=True)
    zone_id = Column(Integer, ForeignKey("zones.id"), nullable=True)
    bin_code = Column(String(20), unique=True, index=True, nullable=False)
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)
    fill_pct = Column(Float, default=0.0)
    status = Column(Enum(BinStatus), default=BinStatus.EMPTY)
    waste_type = Column(Enum(WasteType), default=WasteType.MIXED)
    battery_pct = Column(Float, default=100.0)
    last_emptied_at = Column(DateTime(timezone=True), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    zone = relationship("Zone", back_populates="bins")
    readings = relationship("BinReading", back_populates="bin", order_by="BinReading.timestamp.desc()")
    alerts = relationship("Alert", back_populates="bin")
    classifications = relationship("Classification", back_populates="bin")


class BinReading(Base):
    __tablename__ = "bin_readings"

    id = Column(Integer, primary_key=True, index=True)
    bin_id = Column(Integer, ForeignKey("bins.id"), nullable=False)
    fill_pct = Column(Float, nullable=False)
    weight_kg = Column(Float, nullable=True)
    battery_pct = Column(Float, nullable=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

    bin = relationship("Bin", back_populates="readings")


class Vehicle(Base):
    __tablename__ = "vehicles"

    id = Column(Integer, primary_key=True, index=True)
    vehicle_code = Column(String(20), unique=True, index=True, nullable=False)
    vehicle_type = Column(String(50), nullable=False)
    capacity_kg = Column(Float, nullable=False)
    current_load_kg = Column(Float, default=0.0)
    battery_pct = Column(Float, default=100.0)
    status = Column(Enum(VehicleStatus), default=VehicleStatus.IDLE)
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)
    driver_name = Column(String(100), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    routes = relationship("Route", back_populates="vehicle")


class SanitationSite(Base):
    __tablename__ = "sanitation_sites"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)
    site_type = Column(String(50), nullable=False)
    last_sanitized_at = Column(DateTime(timezone=True), nullable=True)
    uv_c_status = Column(Boolean, default=False)
    mist_status = Column(Boolean, default=False)
    supply_liters = Column(Float, default=0.0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    sanitization_logs = relationship("SanitizationLog", back_populates="site")


class SanitizationLog(Base):
    __tablename__ = "sanitization_logs"

    id = Column(Integer, primary_key=True, index=True)
    site_id = Column(Integer, ForeignKey("sanitation_sites.id"), nullable=False)
    action_type = Column(String(50), nullable=False)
    duration_seconds = Column(Integer, nullable=True)
    supply_used_liters = Column(Float, nullable=True)
    performed_by = Column(String(100), nullable=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

    site = relationship("SanitationSite", back_populates="sanitization_logs")


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    bin_id = Column(Integer, ForeignKey("bins.id"), nullable=True)
    alert_type = Column(String(50), nullable=False)
    severity = Column(Enum(AlertSeverity), default=AlertSeverity.INFO)
    message = Column(Text, nullable=False)
    is_resolved = Column(Boolean, default=False)
    resolved_at = Column(DateTime(timezone=True), nullable=True)
    resolved_by = Column(String(100), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    bin = relationship("Bin", back_populates="alerts")


class Classification(Base):
    __tablename__ = "classifications"

    id = Column(Integer, primary_key=True, index=True)
    bin_id = Column(Integer, ForeignKey("bins.id"), nullable=False)
    waste_type = Column(Enum(WasteType), nullable=False)
    confidence = Column(Float, nullable=False)
    weight_kg = Column(Float, nullable=True)
    image_url = Column(String(500), nullable=True)
    model_version = Column(String(50), nullable=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

    bin = relationship("Bin", back_populates="classifications")


class Route(Base):
    __tablename__ = "routes"

    id = Column(Integer, primary_key=True, index=True)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"), nullable=False)
    bin_ids = Column(Text, nullable=False)
    status = Column(String(50), default="planned")
    distance_km = Column(Float, default=0.0)
    estimated_time_min = Column(Integer, default=0)
    fuel_saved_kg = Column(Float, default=0.0)
    started_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    vehicle = relationship("Vehicle", back_populates="routes")