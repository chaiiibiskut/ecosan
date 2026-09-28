import random
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.database import get_db
from app.models import SanitationSite, SanitizationLog
from app.schemas import (
    SanitationSiteResponse, SanitationSiteCreate, SanitationSiteUpdate,
    SanitizationLogCreate, SanitizationLogResponse,
    SanitizationScoreResponse
)
from app.services.sanitization_engine import compute_sanitization_score, get_sanitization_status

router = APIRouter(prefix="/api/sanitization", tags=["sanitization"])


@router.get("/sites", response_model=List[SanitationSiteResponse])
@router.get("/sanitation/sites", response_model=List[SanitationSiteResponse], include_in_schema=False)
def list_sites(
    site_type: Optional[str] = None,
    active_only: bool = True,
    db: Session = Depends(get_db)
):
    query = db.query(SanitationSite)
    if active_only:
        query = query.filter(SanitationSite.is_active == True)
    if site_type:
        query = query.filter(SanitationSite.site_type == site_type)
    return query.all()


@router.get("/sites/{site_id}", response_model=SanitationSiteResponse)
def get_site(site_id: int, db: Session = Depends(get_db)):
    site = db.query(SanitationSite).filter(SanitationSite.id == site_id).first()
    if not site:
        raise HTTPException(status_code=404, detail="Site not found")
    return site


@router.post("/sites", response_model=SanitationSiteResponse, status_code=201)
def create_site(site_data: SanitationSiteCreate, db: Session = Depends(get_db)):
    site = SanitationSite(**site_data.model_dump())
    db.add(site)
    db.commit()
    db.refresh(site)
    return site


@router.patch("/sites/{site_id}", response_model=SanitationSiteResponse)
def update_site(site_id: int, site_data: SanitationSiteUpdate, db: Session = Depends(get_db)):
    site = db.query(SanitationSite).filter(SanitationSite.id == site_id).first()
    if not site:
        raise HTTPException(status_code=404, detail="Site not found")
    
    update_data = site_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(site, field, value)
    
    site.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(site)
    return site


@router.post("/sites/{site_id}/trigger", response_model=SanitizationLogResponse)
def trigger_sanitization(
    site_id: int,
    action_type: str = "uv_c_mist",
    duration_seconds: int = 300,
    performed_by: str = "auto",
    db: Session = Depends(get_db)
):
    site = db.query(SanitationSite).filter(SanitationSite.id == site_id).first()
    if not site:
        raise HTTPException(status_code=404, detail="Site not found")
    
    supply_used = duration_seconds * 0.1
    
    log = SanitizationLog(
        site_id=site_id,
        action_type=action_type,
        duration_seconds=duration_seconds,
        supply_used_liters=round(supply_used, 1),
        performed_by=performed_by
    )
    db.add(log)
    
    site.last_sanitized_at = datetime.utcnow()
    site.supply_liters = max(0, site.supply_liters - supply_used)
    
    if "uv_c" in action_type.lower():
        site.uv_c_status = True
    if "mist" in action_type.lower():
        site.mist_status = True
    
    site.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(log)
    return log


@router.get("/sites/{site_id}/logs", response_model=List[SanitizationLogResponse])
def get_site_logs(site_id: int, limit: int = 50, db: Session = Depends(get_db)):
    site = db.query(SanitationSite).filter(SanitationSite.id == site_id).first()
    if not site:
        raise HTTPException(status_code=404, detail="Site not found")
    
    logs = db.query(SanitizationLog).filter(
        SanitizationLog.site_id == site_id
    ).order_by(SanitizationLog.timestamp.desc()).limit(limit).all()
    return logs


@router.get("/sites/{site_id}/score", response_model=SanitizationScoreResponse)
def get_site_score(site_id: int, db: Session = Depends(get_db)):
    site = db.query(SanitationSite).filter(SanitationSite.id == site_id).first()
    if not site:
        raise HTTPException(status_code=404, detail="Site not found")
    
    minutes_since_cleaned = None
    if site.last_sanitized_at:
        delta = datetime.utcnow() - site.last_sanitized_at
        minutes_since_cleaned = int(delta.total_seconds() / 60)
    
    score = compute_sanitization_score(
        footfall_per_hour=site.footfall_per_hour,
        minutes_since_cleaned=minutes_since_cleaned,
        odor_level_ppm=site.odor_level_ppm,
    )
    
    return SanitizationScoreResponse(
        site_id=site.id,
        site_name=site.name,
        score=score,
        footfall_per_hour=site.footfall_per_hour,
        minutes_since_cleaned=minutes_since_cleaned,
        odor_level_ppm=site.odor_level_ppm,
        last_sanitized_at=site.last_sanitized_at,
        status=get_sanitization_status(score)
    )


@router.get("/scores", response_model=List[SanitizationScoreResponse])
def get_all_scores(db: Session = Depends(get_db)):
    sites = db.query(SanitationSite).filter(SanitationSite.is_active == True).all()
    scores = []
    for site in sites:
        minutes_since_cleaned = None
        if site.last_sanitized_at:
            delta = datetime.utcnow() - site.last_sanitized_at
            minutes_since_cleaned = int(delta.total_seconds() / 60)
        
        score = compute_sanitization_score(
            footfall_per_hour=site.footfall_per_hour,
            minutes_since_cleaned=minutes_since_cleaned,
            odor_level_ppm=site.odor_level_ppm,
        )
        
        scores.append(SanitizationScoreResponse(
            site_id=site.id,
            site_name=site.name,
            score=score,
            footfall_per_hour=site.footfall_per_hour,
            minutes_since_cleaned=minutes_since_cleaned,
            odor_level_ppm=site.odor_level_ppm,
            last_sanitized_at=site.last_sanitized_at,
            status=get_sanitization_status(score)
        ))
    return scores


@router.post("/sites/{site_id}/clean", response_model=SanitizationScoreResponse)
def mark_site_cleaned(
    site_id: int,
    action_type: str = "uv_c_mist",
    duration_seconds: int = 300,
    performed_by: str = "operator",
    db: Session = Depends(get_db)
):
    site = db.query(SanitationSite).filter(SanitationSite.id == site_id).first()
    if not site:
        raise HTTPException(status_code=404, detail="Site not found")
    
    supply_used = duration_seconds * 0.1
    
    log = SanitizationLog(
        site_id=site_id,
        action_type=action_type,
        duration_seconds=duration_seconds,
        supply_used_liters=round(supply_used, 1),
        performed_by=performed_by
    )
    db.add(log)
    
    site.last_sanitized_at = datetime.utcnow()
    site.supply_liters = max(0, site.supply_liters - supply_used)
    site.odor_level_ppm = max(0, site.odor_level_ppm - random.uniform(50, 150))
    
    if "uv_c" in action_type.lower():
        site.uv_c_status = True
    if "mist" in action_type.lower():
        site.mist_status = True
    
    site.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(site)
    
    minutes_since_cleaned = 0
    score = compute_sanitization_score(
        footfall_per_hour=site.footfall_per_hour,
        minutes_since_cleaned=minutes_since_cleaned,
        odor_level_ppm=site.odor_level_ppm,
    )
    
    return SanitizationScoreResponse(
        site_id=site.id,
        site_name=site.name,
        score=score,
        footfall_per_hour=site.footfall_per_hour,
        minutes_since_cleaned=minutes_since_cleaned,
        odor_level_ppm=site.odor_level_ppm,
        last_sanitized_at=site.last_sanitized_at,
        status=get_sanitization_status(score)
    )