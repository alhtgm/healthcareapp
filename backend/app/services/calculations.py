from typing import Optional


def mifflin_bmr(weight_kg: float, height_cm: float, age: int, sex: str) -> float:
    if sex and sex.lower() in ("male", "m"):
        return 10 * weight_kg + 6.25 * height_cm - 5 * age + 5
    else:
        return 10 * weight_kg + 6.25 * height_cm - 5 * age - 161


def katch_bmr(lbm_kg: float) -> float:
    return 370 + 21.6 * lbm_kg


def compute_bmr(weight_kg: float, height_cm: float, age: int, sex: str, bodyfat_pct: Optional[float] = None, muscle_mass_kg: Optional[float] = None) -> float:
    if bodyfat_pct is not None:
        lbm = weight_kg * (1 - bodyfat_pct / 100.0)
        return katch_bmr(lbm)
    # muscle_mass_kg is only a reference; do not treat as full LBM replacement
    return mifflin_bmr(weight_kg, height_cm, age, sex)


def compute_tdee(bmr: float, activity_level: float) -> float:
    return bmr * (activity_level or 1.2)


def recommended_intake(tdee: float, goal_calories_kcal: Optional[int] = None, goal_rate_kg_per_week: Optional[float] = None) -> float:
    if goal_calories_kcal is not None:
        return float(goal_calories_kcal)
    if goal_rate_kg_per_week is not None:
        daily_delta = (goal_rate_kg_per_week * 7700) / 7.0
        return tdee + daily_delta
    return tdee
