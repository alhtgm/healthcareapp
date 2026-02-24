from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime

from ..db import get_db
from .. import models, schemas
from ..services.calculations import compute_bmr, compute_tdee, recommended_intake

router = APIRouter()


@router.get("/", response_model=schemas.ProfileResponse)
def get_profile(db: Session = Depends(get_db)):
    # single-user demo: assume user_id=1
    profile = db.query(models.Profile).filter(models.Profile.user_id == 1).first()
    if not profile:
        raise HTTPException(status_code=404, detail="profile not found")
    return profile


@router.put("/", response_model=schemas.ProfileResponse)
def put_profile(payload: schemas.ProfileCreate, db: Session = Depends(get_db)):
    profile = db.query(models.Profile).filter(models.Profile.user_id == 1).first()
    if not profile:
        profile = models.Profile(user_id=1)
        db.add(profile)

    for k, v in payload.dict(exclude_unset=True).items():
        setattr(profile, k, v)
    profile.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(profile)
    return profile


@router.get("/compute")
def compute_profile_metrics(db: Session = Depends(get_db)):
    profile = db.query(models.Profile).filter(models.Profile.user_id == 1).first()
    if not profile:
        raise HTTPException(status_code=404, detail="profile not found")

    # require weight/height/age/sex for meaningful results
    if not profile.height_cm or not profile.age or not profile.activity_level:
        raise HTTPException(status_code=400, detail="insufficient profile data")

    # For demo, use goal_weight_kg if present else 70kg
    weight = profile.goal_weight_kg or 70.0
    bodyfat = profile.current_bodyfat_pct

    bmr = compute_bmr(weight, profile.height_cm, profile.age, profile.sex or "", bodyfat)
    tdee = compute_tdee(bmr, profile.activity_level)
    
    # Calculate recommended intake based on goal rate
    rec_intake = recommended_intake(tdee, None, profile.goal_rate_kg_per_week)
    
    # Calculate goal rate from goal difference
    goal_rate = None
    if profile.goal_weight_kg:
        # Assume user wants to reach goal in 12 weeks
        weekly_change = (profile.goal_weight_kg - weight) / 12.0
        goal_rate = weekly_change
    
    return {"bmr": bmr, "tdee": tdee, "recommended_intake": rec_intake, "recommended_rate_kg_per_week": goal_rate}
