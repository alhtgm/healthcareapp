from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from ..db import get_db
from .. import models, schemas

router = APIRouter()


@router.get("/templates", response_model=List[schemas.WorkoutTemplateResponse])
def get_templates(db: Session = Depends(get_db)):
    templates = db.query(models.WorkoutTemplate).filter(models.WorkoutTemplate.user_id == 1).all()
    return templates


@router.post("/templates", response_model=schemas.WorkoutTemplateResponse)
def create_template(payload: schemas.WorkoutTemplateCreate, db: Session = Depends(get_db)):
    tpl = models.WorkoutTemplate(user_id=1, name=payload.name, description=payload.description)
    db.add(tpl)
    db.commit()
    db.refresh(tpl)
    # items
    if payload.items:
        for it in payload.items:
            item = models.WorkoutTemplateItem(template_id=tpl.id, **it.dict())
            db.add(item)
        db.commit()
    db.refresh(tpl)
    return tpl


@router.put("/templates/{tpl_id}", response_model=schemas.WorkoutTemplateResponse)
def update_template(tpl_id: int, payload: schemas.WorkoutTemplateBase, db: Session = Depends(get_db)):
    tpl = db.query(models.WorkoutTemplate).filter(models.WorkoutTemplate.user_id == 1, models.WorkoutTemplate.id == tpl_id).first()
    if not tpl:
        raise HTTPException(status_code=404, detail="not found")
    tpl.name = payload.name
    tpl.description = payload.description
    db.commit()
    db.refresh(tpl)
    return tpl


@router.delete("/templates/{tpl_id}")
def delete_template(tpl_id: int, db: Session = Depends(get_db)):
    tpl = db.query(models.WorkoutTemplate).filter(models.WorkoutTemplate.user_id == 1, models.WorkoutTemplate.id == tpl_id).first()
    if not tpl:
        raise HTTPException(status_code=404, detail="not found")
    db.delete(tpl)
    db.commit()
    return {"status": "deleted"}


@router.get("/templates/{tpl_id}/items", response_model=List[schemas.WorkoutTemplateItemResponse])
def get_template_items(tpl_id: int, db: Session = Depends(get_db)):
    items = db.query(models.WorkoutTemplateItem).filter(models.WorkoutTemplateItem.template_id == tpl_id).order_by(models.WorkoutTemplateItem.order_index).all()
    return items


@router.put("/templates/{tpl_id}/items", response_model=List[schemas.WorkoutTemplateItemResponse])
def upsert_template_items(tpl_id: int, items: List[schemas.WorkoutTemplateItemCreate], db: Session = Depends(get_db)):
    # simple approach: delete existing and recreate
    db.query(models.WorkoutTemplateItem).filter(models.WorkoutTemplateItem.template_id == tpl_id).delete()
    db.commit()
    created = []
    for it in items:
        obj = models.WorkoutTemplateItem(template_id=tpl_id, **it.dict())
        db.add(obj)
        created.append(obj)
    db.commit()
    return created


@router.get("/sessions", response_model=List[schemas.WorkoutSessionResponse])
def get_sessions(from_date: Optional[str] = Query(None, alias="from"), to_date: Optional[str] = Query(None, alias="to"), db: Session = Depends(get_db)):
    q = db.query(models.WorkoutSession).filter(models.WorkoutSession.user_id == 1)
    if from_date:
        q = q.filter(models.WorkoutSession.date >= from_date)
    if to_date:
        q = q.filter(models.WorkoutSession.date <= to_date)
    return q.order_by(models.WorkoutSession.date.desc()).all()


@router.post("/sessions", response_model=schemas.WorkoutSessionResponse)
def create_session(payload: schemas.WorkoutSessionCreate, db: Session = Depends(get_db)):
    sess = models.WorkoutSession(user_id=1, date=payload.date, template_id=payload.template_id, note=payload.note)
    db.add(sess)
    db.commit()
    db.refresh(sess)
    if payload.sets:
        for s in payload.sets:
            obj = models.WorkoutSet(session_id=sess.id, **s.dict())
            db.add(obj)
        db.commit()
    db.refresh(sess)
    return sess


@router.get("/sessions/{id}", response_model=schemas.WorkoutSessionResponse)
def get_session(id: int, db: Session = Depends(get_db)):
    sess = db.query(models.WorkoutSession).filter(models.WorkoutSession.user_id == 1, models.WorkoutSession.id == id).first()
    if not sess:
        raise HTTPException(status_code=404, detail="not found")
    return sess


@router.delete("/sessions/{id}")
def delete_session(id: int, db: Session = Depends(get_db)):
    sess = db.query(models.WorkoutSession).filter(models.WorkoutSession.user_id == 1, models.WorkoutSession.id == id).first()
    if not sess:
        raise HTTPException(status_code=404, detail="not found")
    db.delete(sess)
    db.commit()
    return {"status": "deleted"}
