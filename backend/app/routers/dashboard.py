from fastapi import APIRouter, Depends, Query, HTTPException
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta, date
from typing import Optional, List

from ..db import get_db
from .. import models, schemas
from ..services.calculations import compute_bmr, compute_tdee, recommended_intake

router = APIRouter()


def parse_date(s: Optional[str], default: date) -> date:
    if not s:
        return default
    return datetime.strptime(s, "%Y-%m-%d").date()


@router.get("/summary", response_model=schemas.DashboardSummary)
def summary(from_date: Optional[str] = Query(None, alias="from"), to_date: Optional[str] = Query(None, alias="to"), db: Session = Depends(get_db)):
    today = date.today()
    to_d = parse_date(to_date, today)
    from_d = parse_date(from_date, to_d - timedelta(days=29))

    # weight/bodyfat series
    body_q = db.query(models.BodyLog).filter(models.BodyLog.user_id == 1, models.BodyLog.date >= from_d, models.BodyLog.date <= to_d).order_by(models.BodyLog.date)
    weight_series = [schemas.SeriesPoint(date=r.date, value=r.weight_kg) for r in body_q.all()]
    bodyfat_series = [schemas.SeriesPoint(date=r.date, value=r.bodyfat_pct) for r in body_q.all()]

    # intake series (daily sum)
    intake_q = db.query(models.MealLog.date, func.sum(models.MealLog.calories_kcal).label("total")).filter(models.MealLog.user_id == 1, models.MealLog.date >= from_d, models.MealLog.date <= to_d).group_by(models.MealLog.date).order_by(models.MealLog.date)
    intake_series = [schemas.SeriesPoint(date=r.date, value=float(r.total)) for r in intake_q.all()]

    # protein series (daily sum)
    protein_q = db.query(models.MealLog.date, func.sum(models.MealLog.protein_g).label("total")).filter(models.MealLog.user_id == 1, models.MealLog.date >= from_d, models.MealLog.date <= to_d).group_by(models.MealLog.date).order_by(models.MealLog.date)
    protein_series = [schemas.SeriesPoint(date=r.date, value=(float(r.total) if r.total is not None else 0.0)) for r in protein_q.all()]

    # profile and tdee
    profile = db.query(models.Profile).filter(models.Profile.user_id == 1).first()
    if not profile:
        raise HTTPException(status_code=404, detail="profile not found")

    # pick current weight from latest body log if available
    latest_body = db.query(models.BodyLog).filter(models.BodyLog.user_id == 1).order_by(models.BodyLog.date.desc()).first()
    current_weight = latest_body.weight_kg if latest_body else (profile.goal_weight_kg or 70.0)
    current_bodyfat = latest_body.bodyfat_pct if latest_body else profile.current_bodyfat_pct

    bmr = compute_bmr(current_weight, profile.height_cm or 170, profile.age or 30, profile.sex or "", current_bodyfat)
    tdee = compute_tdee(bmr, profile.activity_level or 1.2)
    rec = recommended_intake(tdee, profile.goal_calories_kcal, profile.goal_rate_kg_per_week)

    # avg intake 7d (ending at to_d)
    start7 = to_d - timedelta(days=6)
    avg_q = db.query(func.sum(models.MealLog.calories_kcal).label("total"), func.count(func.distinct(models.MealLog.date)).label("days")).filter(models.MealLog.user_id == 1, models.MealLog.date >= start7, models.MealLog.date <= to_d)
    ag = avg_q.first()
    if ag and ag.days and ag.total is not None:
        avg_7d = float(ag.total) / float(7)
    else:
        avg_7d = None

    # avg protein 7d
    pavg_q = db.query(func.sum(models.MealLog.protein_g).label("total"), func.count(func.distinct(models.MealLog.date)).label("days")).filter(models.MealLog.user_id == 1, models.MealLog.date >= start7, models.MealLog.date <= to_d)
    pag = pavg_q.first()
    if pag and pag.days and pag.total is not None:
        avg_protein_7d = float(pag.total) / float(7)
    else:
        avg_protein_7d = None

    recommendation_text = None
    if avg_7d is not None:
        recommend_adjust = rec - avg_7d
        sign = "+" if recommend_adjust > 0 else ""
        # produce a clean Japanese recommendation string
        recommendation_text = f"目標に近づくには、平均摂取を {sign}{int(recommend_adjust)} kcal/日 調整してください。"

    # convert date objects to ISO strings for JSON serialization
    result = {
        "weight_series": [{"date": r.date.isoformat(), "value": r.value} for r in weight_series],
        "bodyfat_series": [{"date": r.date.isoformat(), "value": r.value} for r in bodyfat_series],
        "intake_series": [{"date": r.date.isoformat(), "value": r.value} for r in intake_series],
        "protein_series": [{"date": r.date.isoformat(), "value": r.value} for r in protein_series],
        "tdee": tdee,
        "recommended_intake": rec,
        "avg_intake_7d": avg_7d,
        "avg_protein_7d": avg_protein_7d,
        "recommendation_text": recommendation_text,
    }

    # Return JSON with explicit UTF-8 charset to avoid client-side garbling
    return JSONResponse(content=result, media_type="application/json; charset=utf-8")
