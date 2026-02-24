from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    Date,
    Text,
    ForeignKey,
    DateTime,
    UniqueConstraint,
    Index,
)
from sqlalchemy.orm import relationship
from datetime import datetime

from .db import Base


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, nullable=True)
    password_hash = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class Profile(Base):
    __tablename__ = "profile"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    sex = Column(String, nullable=True)
    age = Column(Integer, nullable=True)
    height_cm = Column(Float, nullable=True)
    activity_level = Column(Float, nullable=True)
    current_bodyfat_pct = Column(Float, nullable=True)
    current_muscle_mass_kg = Column(Float, nullable=True)
    goal_weight_kg = Column(Float, nullable=True)
    goal_bodyfat_pct = Column(Float, nullable=True)
    goal_calories_kcal = Column(Integer, nullable=True)
    goal_rate_kg_per_week = Column(Float, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class BodyLog(Base):
    __tablename__ = "body_logs"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    date = Column(Date, nullable=False)
    weight_kg = Column(Float, nullable=False)
    bodyfat_pct = Column(Float, nullable=True)
    muscle_mass_kg = Column(Float, nullable=True)
    sleep_hours = Column(Float, nullable=True)
    condition_note = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    __table_args__ = (UniqueConstraint("user_id", "date", name="uix_user_date_body"),)


class MealLog(Base):
    __tablename__ = "meal_logs"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    date = Column(Date, index=True, nullable=False)
    meal_type = Column(String, nullable=False)
    calories_kcal = Column(Integer, nullable=False)
    protein_g = Column(Float, nullable=True)
    fat_g = Column(Float, nullable=True)
    carbs_g = Column(Float, nullable=True)
    memo = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class WorkoutTemplate(Base):
    __tablename__ = "workout_templates"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    items = relationship("WorkoutTemplateItem", back_populates="template")


class WorkoutTemplateItem(Base):
    __tablename__ = "workout_template_items"
    id = Column(Integer, primary_key=True, index=True)
    template_id = Column(Integer, ForeignKey("workout_templates.id"))
    exercise_name = Column(String, nullable=False)
    target_sets = Column(Integer, nullable=True)
    target_reps = Column(String, nullable=True)
    target_weight_kg = Column(Float, nullable=True)
    order_index = Column(Integer, nullable=True)
    template = relationship("WorkoutTemplate", back_populates="items")


class WorkoutSession(Base):
    __tablename__ = "workout_sessions"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    date = Column(Date, index=True, nullable=False)
    template_id = Column(Integer, ForeignKey("workout_templates.id"), nullable=True)
    note = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    sets = relationship("WorkoutSet", back_populates="session")


class WorkoutSet(Base):
    __tablename__ = "workout_sets"
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("workout_sessions.id"))
    exercise_name = Column(String, nullable=False)
    set_no = Column(Integer, nullable=False)
    reps = Column(Integer, nullable=True)
    weight_kg = Column(Float, nullable=True)
    rir = Column(Integer, nullable=True)
    note = Column(Text, nullable=True)
    session = relationship("WorkoutSession", back_populates="sets")
