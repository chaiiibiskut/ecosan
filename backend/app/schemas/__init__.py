from pydantic import BaseModel, ConfigDict, field_validator
from typing import Optional, List
from datetime import datetime
from enum import Enum
import json


class BinStatus(str, Enum):
    EMPTY = "empty"
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"
    OFFLINE = "offline"


class WasteType(str, Enum):
    ORGANIC = "organic"
    RECYCLABLE = "recyclable"
    HAZARDOUS = "hazardous"
    SANITARY = "sanitary"
    MIXED = "mixed"


class VehicleStatus(str, Enum):
    IDLE = "idle"
    EN_ROUTE = "en_route"
    COLLECTING = "collecting"
    RETURNING = "returning"
    MAINTENANCE = "maintenance"


class AlertSeverity(str, Enum):
    INFO = "info"
    WARNING = "warning"
    CRITICAL = "critical"


class ZoneBase(BaseModel):
    name: str
    description: Optional[str] = None
    lat: float
    lng: float
    radius_km: float = 1.0


class ZoneCreate(ZoneBase):
    pass


class ZoneResponse(ZoneBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class BinBase(BaseModel):
    zone_id: Optional[int] = None
    bin_code: str
    lat: float
    lng: float
    waste_type: WasteType = WasteType.MIXED


class BinCreate(BinBase):
    pass


class BinUpdate(BaseModel):
    fill_pct: Optional[float] = None
    status: Optional[BinStatus] = None
    waste_type: Optional[WasteType] = None
    battery_pct: Optional[float] = None
    is_active: Optional[bool] = None


class BinResponse(BinBase):
    id: int
    fill_pct: float
    status: BinStatus
    battery_pct: float
    last_emptied_at: Optional[datetime] = None
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    zone: Optional[ZoneResponse] = None

    model_config = ConfigDict(from_attributes=True)


class BinReadingCreate(BaseModel):
    bin_id: int
    fill_pct: float
    weight_kg: Optional[float] = None
    battery_pct: Optional[float] = None
    gas_ppm: Optional[float] = None


class BinReadingResponse(BaseModel):
    id: int
    bin_id: int
    fill_pct: float
    weight_kg: Optional[float] = None
    battery_pct: Optional[float] = None
    gas_ppm: Optional[float] = None
    timestamp: datetime

    model_config = ConfigDict(from_attributes=True)


class VehicleBase(BaseModel):
    vehicle_code: str
    vehicle_type: str
    capacity_kg: float
    lat: float
    lng: float
    driver_name: Optional[str] = None


class VehicleCreate(VehicleBase):
    pass


class VehicleUpdate(BaseModel):
    current_load_kg: Optional[float] = None
    battery_pct: Optional[float] = None
    status: Optional[VehicleStatus] = None
    lat: Optional[float] = None
    lng: Optional[float] = None


class VehicleResponse(VehicleBase):
    id: int
    current_load_kg: float
    battery_pct: float
    status: VehicleStatus
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class SanitationSiteBase(BaseModel):
    name: str
    lat: float
    lng: float
    site_type: str
    footfall_per_hour: int = 50
    odor_level_ppm: float = 0.0


class SanitationSiteCreate(SanitationSiteBase):
    pass


class SanitationSiteUpdate(BaseModel):
    last_sanitized_at: Optional[datetime] = None
    uv_c_status: Optional[bool] = None
    mist_status: Optional[bool] = None
    supply_liters: Optional[float] = None
    is_active: Optional[bool] = None
    footfall_per_hour: Optional[int] = None
    odor_level_ppm: Optional[float] = None


class SanitationSiteResponse(SanitationSiteBase):
    id: int
    last_sanitized_at: Optional[datetime] = None
    uv_c_status: bool
    mist_status: bool
    supply_liters: float
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class SanitizationScoreResponse(BaseModel):
    site_id: int
    site_name: str
    score: int
    footfall_per_hour: int
    minutes_since_cleaned: Optional[int]
    odor_level_ppm: float
    last_sanitized_at: Optional[datetime]
    status: str

    model_config = ConfigDict(from_attributes=True)


class SanitizationLogCreate(BaseModel):
    site_id: int
    action_type: str
    duration_seconds: Optional[int] = None
    supply_used_liters: Optional[float] = None
    performed_by: Optional[str] = None


class SanitizationLogResponse(BaseModel):
    id: int
    site_id: int
    action_type: str
    duration_seconds: Optional[int] = None
    supply_used_liters: Optional[float] = None
    performed_by: Optional[str] = None
    timestamp: datetime

    model_config = ConfigDict(from_attributes=True)


class AlertBase(BaseModel):
    bin_id: Optional[int] = None
    site_id: Optional[int] = None
    alert_type: str
    severity: AlertSeverity = AlertSeverity.INFO
    message: str


class AlertCreate(AlertBase):
    pass


class AlertUpdate(BaseModel):
    is_resolved: Optional[bool] = None
    resolved_by: Optional[str] = None


class AlertResponse(AlertBase):
    id: int
    is_resolved: bool
    resolved_at: Optional[datetime] = None
    resolved_by: Optional[str] = None
    created_at: datetime
    bin: Optional[BinResponse] = None
    site: Optional[SanitationSiteResponse] = None

    model_config = ConfigDict(from_attributes=True)


class ClassificationBase(BaseModel):
    bin_id: int
    waste_type: WasteType
    confidence: float
    weight_kg: Optional[float] = None
    image_url: Optional[str] = None
    model_version: Optional[str] = None
    verified_category: Optional[WasteType] = None


class ClassificationCreate(ClassificationBase):
    pass


class ClassificationResponse(ClassificationBase):
    id: int
    timestamp: datetime
    bin: Optional[BinResponse] = None

    model_config = ConfigDict(from_attributes=True)


class RouteBase(BaseModel):
    vehicle_id: int
    bin_ids: List[int]


class RouteCreate(RouteBase):
    pass


class RouteResponse(BaseModel):
    id: int
    vehicle_id: int
    bin_ids: List[int]
    status: str
    distance_km: float
    estimated_time_min: int
    fuel_saved_kg: float
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    created_at: datetime
    vehicle: Optional[VehicleResponse] = None

    @field_validator("bin_ids", mode="before")
    @classmethod
    def parse_bin_ids(cls, v):
        if isinstance(v, str):
            try:
                return json.loads(v)
            except Exception:
                return []
        return v

    model_config = ConfigDict(from_attributes=True)


class RouteOptimizeRequest(BaseModel):
    vehicle_id: int
    max_bins: int = 10
    max_distance_km: float = 50.0


class KPIResponse(BaseModel):
    total_bins: int
    active_bins: int
    critical_bins: int
    total_vehicles: int
    active_vehicles: int
    total_sites: int
    avg_fill_pct: float
    total_waste_today_kg: float
    segregation_accuracy: Optional[float] = None
    sanitization_index: float