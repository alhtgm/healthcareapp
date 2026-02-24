#!/usr/bin/env python3
import os
import sys

# Ensure clean database start
db_path = 'healthcare.db'
if os.path.exists(db_path):
    os.remove(db_path)
    print(f"Deleted {db_path}")

# Initialize database with tables
from app.db import engine, SessionLocal, Base
from app import models

Base.metadata.create_all(bind=engine)
print("✅ Database tables created")

# Create demo user
db = SessionLocal()
user = models.User(id=1, email='demo@example.com')
db.add(user)
db.commit()
print("✅ Demo user created")

# Seed sample profile
profile = models.Profile(
    user_id=1,
    sex='male',
    age=32,
    height_cm=175,
    activity_level=1.55,
    current_bodyfat_pct=20,
    current_muscle_mass_kg=60,
    goal_weight_kg=72,
    goal_bodyfat_pct=15
)
db.add(profile)
db.commit()
print("✅ Profile seeded")

# Seed 7 days of body and meal logs
from datetime import timedelta, date

today = date.today()
for i in range(6, -1, -1):
    d = today - timedelta(days=i)
    weight = 74 - i * 0.15
    bodyfat = 22 - i * 0.3
    sleep = 6.5 + (i % 3) * 0.5
    
    body_log = models.BodyLog(
        user_id=1,
        date=d,
        weight_kg=weight,
        bodyfat_pct=bodyfat,
        sleep_hours=sleep
    )
    db.add(body_log)
    
    # Meal logs
    for meal_type, cals, prot in [
        ('breakfast', 400 + i*20, 20 + i % 10),
        ('lunch', 700 + i*30, 35 + i % 15),
        ('dinner', 600 + i*25, 30 + i % 12)
    ]:
        meal_log = models.MealLog(
            user_id=1,
            date=d,
            meal_type=meal_type,
            calories_kcal=cals,
            protein_g=prot
        )
        db.add(meal_log)

db.commit()
print("✅ Sample logs seeded")
print("\n✅ Database initialization complete!")
