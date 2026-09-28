from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import random

from app.database import get_db
from app.models import Classification, Bin, WasteType
from app.schemas import ClassificationResponse, ClassificationCreate

router = APIRouter(prefix="/api/ai", tags=["ai-classification"])


WASTE_TYPES = [
    (WasteType.ORGANIC, "Food waste", 0.92, 0.98),
    (WasteType.RECYCLABLE, "PET plastic", 0.88, 0.97),
    (WasteType.RECYCLABLE, "Aluminum can", 0.85, 0.95),
    (WasteType.HAZARDOUS, "Battery", 0.90, 0.99),
    (WasteType.HAZARDOUS, "E-waste", 0.87, 0.96),
    (WasteType.SANITARY, "Diaper", 0.82, 0.93),
    (WasteType.MIXED, "Mixed waste", 0.70, 0.85),
]


@router.post("/classify", response_model=ClassificationResponse)
def classify_waste(classification: ClassificationCreate, db: Session = Depends(get_db)):
    bin = db.query(Bin).filter(Bin.id == classification.bin_id).first()
    if not bin:
        raise HTTPException(status_code=404, detail="Bin not found")
    
    waste_type, label, min_conf, max_conf = random.choice(WASTE_TYPES)
    confidence = round(random.uniform(min_conf, max_conf), 2)
    weight = round(random.uniform(0.1, 5.0), 2)
    
    result = Classification(
        bin_id=classification.bin_id,
        waste_type=waste_type,
        confidence=confidence,
        weight_kg=weight,
        image_url=classification.image_url,
        model_version=classification.model_version or "EcoYOLO-v9-Edge"
    )
    db.add(result)
    
    bin.waste_type = waste_type
    bin.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(result)
    return result


@router.get("/classifications", response_model=List[ClassificationResponse])
def get_classifications(
    bin_id: Optional[int] = None,
    waste_type: Optional[WasteType] = None,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    query = db.query(Classification)
    if bin_id:
        query = query.filter(Classification.bin_id == bin_id)
    if waste_type:
        query = query.filter(Classification.waste_type == waste_type)
    return query.order_by(Classification.timestamp.desc()).limit(limit).all()


@router.get("/classifications/{bin_id}/latest", response_model=ClassificationResponse)
def get_latest_classification(bin_id: int, db: Session = Depends(get_db)):
    bin = db.query(Bin).filter(Bin.id == bin_id).first()
    if not bin:
        raise HTTPException(status_code=404, detail="Bin not found")
    
    classification = db.query(Classification).filter(
        Classification.bin_id == bin_id
    ).order_by(Classification.timestamp.desc()).first()
    
    if not classification:
        raise HTTPException(status_code=404, detail="No classification found for this bin")
    return classification


@router.post("/simulate/{bin_id}", response_model=ClassificationResponse)
def simulate_classification(bin_id: int, db: Session = Depends(get_db)):
    bin = db.query(Bin).filter(Bin.id == bin_id).first()
    if not bin:
        raise HTTPException(status_code=404, detail="Bin not found")
    
    waste_type, label, min_conf, max_conf = random.choice(WASTE_TYPES)
    confidence = round(random.uniform(min_conf, max_conf), 2)
    weight = round(random.uniform(0.1, 5.0), 2)
    
    result = Classification(
        bin_id=bin_id,
        waste_type=waste_type,
        confidence=confidence,
        weight_kg=weight,
        model_version="EcoYOLO-v9-Edge"
    )
    db.add(result)
    
    bin.waste_type = waste_type
    bin.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(result)
    return result