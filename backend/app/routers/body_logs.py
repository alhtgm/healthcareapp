from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List, Optional

from ..db import get_db
from .. import models, schemas

router = APIRouter()


@router.get("/", response_model=List[schemas.BodyLogResponse])
def get_body_logs(from_date: Optional[str] = Query(None, alias="from"), to_date: Optional[str] = Query(None, alias="to"), db: Session = Depends(get_db)):
    q = db.query(models.BodyLog).filter(models.BodyLog.user_id == 1)
    if from_date:
        q = q.filter(models.BodyLog.date >= from_date)
    if to_date:
        q = q.filter(models.BodyLog.date <= to_date)
    return q.order_by(models.BodyLog.date).all()


@router.post("/", response_model=schemas.BodyLogResponse)
def upsert_body_log(payload: schemas.BodyLogCreate, db: Session = Depends(get_db)):
    # upsert by (user_id, date)
    existing = db.query(models.BodyLog).filter(models.BodyLog.user_id == 1, models.BodyLog.date == payload.date).first()
    if existing:
        for k, v in payload.dict(exclude_unset=True).items():
            setattr(existing, k, v)
        existing.created_at = datetime.utcnow()
        db.commit()
        db.refresh(existing)
        return existing

    new = models.BodyLog(user_id=1, **payload.dict())
    db.add(new)
    db.commit()
    db.refresh(new)
    return new


@router.delete("/{item_id}")
def delete_body_log(item_id: int, db: Session = Depends(get_db)):
    obj = db.query(models.BodyLog).filter(models.BodyLog.user_id == 1, models.BodyLog.id == item_id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="not found")
    db.delete(obj)
    db.commit()
    return {"status": "deleted"}
