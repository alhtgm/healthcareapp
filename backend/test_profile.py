from app.db import SessionLocal
from app import models, schemas
from app.services.calculations import compute_bmr, compute_tdee, recommended_intake

db = SessionLocal()

# Create profile
payload = schemas.ProfileCreate(
    sex='male',
    age=32,
    height_cm=175,
    activity_level=1.55,
    current_bodyfat_pct=20,
    current_muscle_mass_kg=60,
    goal_weight_kg=72,
    goal_bodyfat_pct=15
)

profile = db.query(models.Profile).filter(models.Profile.user_id == 1).first()
if not profile:
    profile = models.Profile(user_id=1)
    db.add(profile)

for k, v in payload.dict(exclude_unset=True).items():
    setattr(profile, k, v)

db.commit()
db.refresh(profile)
print("✅ Profile saved successfully")

# Test compute
weight = profile.goal_weight_kg or 70.0
bodyfat = profile.current_bodyfat_pct
print(f"Weight: {weight}, Bodyfat: {bodyfat}")

bmr = compute_bmr(weight, profile.height_cm, profile.age, profile.sex or "", bodyfat)
print(f"BMR: {bmr}")

tdee = compute_tdee(bmr, profile.activity_level)
print(f"TDEE: {tdee}")

rec_intake = recommended_intake(tdee, None, profile.goal_rate_kg_per_week)
print(f"Recommended Intake: {rec_intake}")
