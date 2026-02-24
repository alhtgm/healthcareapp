from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional

from ..db import get_db
from .. import models, schemas
from datetime import date

router = APIRouter()


@router.get("/", response_model=List[schemas.MealLogResponse])
def get_meal_logs(date: Optional[str] = None, db: Session = Depends(get_db)):
    q = db.query(models.MealLog).filter(models.MealLog.user_id == 1)
    if date:
        q = q.filter(models.MealLog.date == date)
    return q.order_by(models.MealLog.date).all()


@router.get("/range", response_model=List[schemas.MealLogResponse])
def get_meal_logs_range(from_date: str = Query(..., alias="from"), to_date: str = Query(..., alias="to"), db: Session = Depends(get_db)):
    q = db.query(models.MealLog).filter(models.MealLog.user_id == 1, models.MealLog.date >= from_date, models.MealLog.date <= to_date)
    return q.order_by(models.MealLog.date).all()


@router.post("/", response_model=schemas.MealLogResponse)
def create_meal_log(payload: schemas.MealLogCreate, db: Session = Depends(get_db)):
    obj = models.MealLog(user_id=1, **payload.dict())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


@router.put("/{item_id}", response_model=schemas.MealLogResponse)
def update_meal_log(item_id: int, payload: schemas.MealLogCreate, db: Session = Depends(get_db)):
    obj = db.query(models.MealLog).filter(models.MealLog.user_id == 1, models.MealLog.id == item_id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="not found")
    for k, v in payload.dict(exclude_unset=True).items():
        setattr(obj, k, v)
    db.commit()
    db.refresh(obj)
    return obj


@router.delete("/{item_id}")
def delete_meal_log(item_id: int, db: Session = Depends(get_db)):
    obj = db.query(models.MealLog).filter(models.MealLog.user_id == 1, models.MealLog.id == item_id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="not found")
    db.delete(obj)
    db.commit()
    return {"status": "deleted"}
