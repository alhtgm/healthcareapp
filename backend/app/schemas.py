from typing import Optional, List
from pydantic import BaseModel, Field, conint, confloat
from datetime import date


class ProfileBase(BaseModel):
    sex: Optional[str] = None
    age: Optional[int] = None
    height_cm: Optional[float] = None
    activity_level: Optional[float] = None
    current_bodyfat_pct: Optional[float] = None
    current_muscle_mass_kg: Optional[float] = None
    goal_weight_kg: Optional[float] = None
    goal_bodyfat_pct: Optional[float] = None
    goal_calories_kcal: Optional[int] = None
    goal_rate_kg_per_week: Optional[float] = None


class ProfileCreate(ProfileBase):
    pass


class ProfileResponse(ProfileBase):
    id: int
    user_id: int

    class Config:
        orm_mode = True


class BodyLogBase(BaseModel):
    date: date
    weight_kg: float
    bodyfat_pct: Optional[float] = None
    muscle_mass_kg: Optional[float] = None
    sleep_hours: Optional[float] = None
    condition_note: Optional[str] = None


class BodyLogCreate(BodyLogBase):
    pass


class BodyLogResponse(BodyLogBase):
    id: int
    user_id: int

    class Config:
        orm_mode = True


class MealLogBase(BaseModel):
    date: date
    meal_type: str
    calories_kcal: int = Field(..., ge=0, le=10000)
    protein_g: Optional[float] = None
    fat_g: Optional[float] = None
    carbs_g: Optional[float] = None
    memo: Optional[str] = None


class MealLogCreate(MealLogBase):
    pass


class MealLogResponse(MealLogBase):
    id: int
    user_id: int

    class Config:
        orm_mode = True


class SeriesPoint(BaseModel):
    date: date
    value: Optional[float]


class DashboardSummary(BaseModel):
    weight_series: List[SeriesPoint] = []
    bodyfat_series: List[SeriesPoint] = []
    intake_series: List[SeriesPoint] = []
    protein_series: List[SeriesPoint] = []
    tdee: Optional[float] = None
    recommended_intake: Optional[float] = None
    avg_intake_7d: Optional[float] = None
    avg_protein_7d: Optional[float] = None
    recommendation_text: Optional[str] = None

    class Config:
        orm_mode = True


class WorkoutTemplateItemBase(BaseModel):
    exercise_name: str
    target_sets: Optional[int] = None
    target_reps: Optional[str] = None
    target_weight_kg: Optional[float] = None
    order_index: Optional[int] = None


class WorkoutTemplateItemCreate(WorkoutTemplateItemBase):
    pass


class WorkoutTemplateItemResponse(WorkoutTemplateItemBase):
    id: int
    template_id: int

    class Config:
        orm_mode = True


class WorkoutTemplateBase(BaseModel):
    name: str
    description: Optional[str] = None


class WorkoutTemplateCreate(WorkoutTemplateBase):
    items: Optional[List[WorkoutTemplateItemCreate]] = None


class WorkoutTemplateResponse(WorkoutTemplateBase):
    id: int
    user_id: int
    items: List[WorkoutTemplateItemResponse] = []

    class Config:
        orm_mode = True


class WorkoutSetBase(BaseModel):
    exercise_name: str
    set_no: int
    reps: Optional[int] = None
    weight_kg: Optional[float] = None
    rir: Optional[int] = None
    note: Optional[str] = None


class WorkoutSetCreate(WorkoutSetBase):
    pass


class WorkoutSetResponse(WorkoutSetBase):
    id: int
    session_id: int

    class Config:
        orm_mode = True


class WorkoutSessionBase(BaseModel):
    date: date
    template_id: Optional[int] = None
    note: Optional[str] = None


class WorkoutSessionCreate(WorkoutSessionBase):
    sets: Optional[List[WorkoutSetCreate]] = None


class WorkoutSessionResponse(WorkoutSessionBase):
    id: int
    user_id: int
    sets: List[WorkoutSetResponse] = []

    class Config:
        orm_mode = True
