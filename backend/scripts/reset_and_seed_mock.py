from __future__ import annotations

import os
import sys
from pathlib import Path
from datetime import date, timedelta

ROOT_DIR = Path(__file__).resolve().parents[1]
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

DB_PATH = 'healthcare.db'


def reset_db() -> None:
    removed = False
    if os.path.exists(DB_PATH):
        try:
            os.remove(DB_PATH)
            removed = True
            print(f'[OK] Deleted {DB_PATH}')
        except PermissionError:
            print(f'[WARN] Could not delete {DB_PATH} because it is locked. Recreating all tables in-place.')
    else:
        print(f'[INFO] {DB_PATH} not found; creating new database')

    from app.db import Base, engine

    if not removed:
        Base.metadata.drop_all(bind=engine)
        print('[OK] Dropped existing tables')
    Base.metadata.create_all(bind=engine)
    print('[OK] Recreated tables')


def seed_data() -> None:
    from app import models
    from app.db import SessionLocal

    db = SessionLocal()
    try:
        # Ensure a fully clean state even when file deletion is not possible.
        db.query(models.WorkoutSet).delete()
        db.query(models.WorkoutSession).delete()
        db.query(models.WorkoutTemplateItem).delete()
        db.query(models.WorkoutTemplate).delete()
        db.query(models.MealLog).delete()
        db.query(models.BodyLog).delete()
        db.query(models.Profile).delete()
        db.query(models.User).delete()
        db.commit()

        user = models.User(id=1, email='demo@example.com')
        db.add(user)

        profile = models.Profile(
            user_id=1,
            sex='male',
            age=29,
            height_cm=173,
            activity_level=1.55,
            current_bodyfat_pct=19.5,
            current_muscle_mass_kg=58.0,
            goal_weight_kg=70.0,
            goal_bodyfat_pct=14.0,
            goal_rate_kg_per_week=-0.3,
        )
        db.add(profile)

        today = date.today()

        for offset in range(27, -1, -1):
            d = today - timedelta(days=offset)
            weight = round(74.0 - (27 - offset) * 0.08, 1)
            bodyfat = round(21.0 - (27 - offset) * 0.07, 1)
            sleep = round(6.3 + (offset % 4) * 0.4, 1)

            db.add(
                models.BodyLog(
                    user_id=1,
                    date=d,
                    weight_kg=weight,
                    bodyfat_pct=bodyfat,
                    sleep_hours=sleep,
                    condition_note='通常',
                )
            )

            breakfast_cals = 420 + (offset % 5) * 20
            lunch_cals = 680 + (offset % 4) * 35
            dinner_cals = 620 + (offset % 6) * 25
            snack_cals = 150 + (offset % 3) * 30

            breakfast_protein = 24 + (offset % 4)
            lunch_protein = 34 + (offset % 5)
            dinner_protein = 38 + (offset % 4)
            snack_protein = 8 + (offset % 3)

            meal_rows = [
                ('breakfast', breakfast_cals, breakfast_protein),
                ('lunch', lunch_cals, lunch_protein),
                ('dinner', dinner_cals, dinner_protein),
                ('snack', snack_cals, snack_protein),
            ]

            for meal_type, cals, protein in meal_rows:
                db.add(
                    models.MealLog(
                        user_id=1,
                        date=d,
                        meal_type=meal_type,
                        calories_kcal=int(cals),
                        protein_g=float(protein),
                    )
                )

        push_day = models.WorkoutTemplate(user_id=1, name='プッシュ day', description='胸・肩・三頭')
        pull_day = models.WorkoutTemplate(user_id=1, name='プル day', description='背中・二頭')
        legs_day = models.WorkoutTemplate(user_id=1, name='レッグ day', description='脚・臀部')
        db.add_all([push_day, pull_day, legs_day])
        db.flush()

        push_items = [
            ('ベンチプレス', 4, '6-8', 70.0),
            ('インクラインダンベルプレス', 3, '8-10', 24.0),
            ('ショルダープレス', 3, '8-10', 40.0),
        ]
        pull_items = [
            ('デッドリフト', 3, '4-6', 110.0),
            ('ラットプルダウン', 3, '8-12', 55.0),
            ('シーテッドロー', 3, '8-12', 52.5),
        ]
        leg_items = [
            ('スクワット', 4, '5-8', 95.0),
            ('レッグプレス', 3, '10-12', 160.0),
            ('ルーマニアンデッドリフト', 3, '8-10', 75.0),
        ]

        for idx, (name, sets, reps, w) in enumerate(push_items):
            db.add(models.WorkoutTemplateItem(template_id=push_day.id, exercise_name=name, target_sets=sets, target_reps=reps, target_weight_kg=w, order_index=idx))
        for idx, (name, sets, reps, w) in enumerate(pull_items):
            db.add(models.WorkoutTemplateItem(template_id=pull_day.id, exercise_name=name, target_sets=sets, target_reps=reps, target_weight_kg=w, order_index=idx))
        for idx, (name, sets, reps, w) in enumerate(leg_items):
            db.add(models.WorkoutTemplateItem(template_id=legs_day.id, exercise_name=name, target_sets=sets, target_reps=reps, target_weight_kg=w, order_index=idx))

        db.flush()

        training_days = [today - timedelta(days=d) for d in [0, 1, 3, 5, 7, 10, 12, 14]]
        template_cycle = [push_day, pull_day, legs_day]

        for i, d in enumerate(sorted(training_days)):
            template = template_cycle[i % len(template_cycle)]
            session = models.WorkoutSession(
                user_id=1,
                date=d,
                template_id=template.id,
                note='フォーム重視',
            )
            db.add(session)
            db.flush()

            template_items = (
                db.query(models.WorkoutTemplateItem)
                .filter(models.WorkoutTemplateItem.template_id == template.id)
                .order_by(models.WorkoutTemplateItem.order_index)
                .all()
            )

            for item in template_items:
                target_sets = item.target_sets or 3
                base_weight = item.target_weight_kg or 40.0
                for s in range(1, target_sets + 1):
                    db.add(
                        models.WorkoutSet(
                            session_id=session.id,
                            exercise_name=item.exercise_name,
                            set_no=s,
                            reps=max(5, 10 - s),
                            weight_kg=round(base_weight + i * 0.5, 1),
                            note='',
                        )
                    )

        db.commit()

        body_count = db.query(models.BodyLog).count()
        meal_count = db.query(models.MealLog).count()
        template_count = db.query(models.WorkoutTemplate).count()
        session_count = db.query(models.WorkoutSession).count()
        set_count = db.query(models.WorkoutSet).count()

        print('[OK] Seeded mock data')
        print(f'  Body logs     : {body_count}')
        print(f'  Meal logs     : {meal_count}')
        print(f'  Templates     : {template_count}')
        print(f'  Sessions      : {session_count}')
        print(f'  Workout sets  : {set_count}')
    finally:
        db.close()


if __name__ == '__main__':
    reset_db()
    seed_data()
