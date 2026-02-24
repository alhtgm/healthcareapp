import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .db import engine, Base
from .routers import profile, body_logs, meal_logs, dashboard
from .routers import workouts

app = FastAPI(title="healthcareapp backend")

cors_origins = os.getenv("CORS_ORIGINS", "*")
allow_origins = ["*"] if cors_origins.strip() == "*" else [x.strip() for x in cors_origins.split(",") if x.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    # Create DB tables (for dev/demo). Alembic should be used for prod.
    Base.metadata.create_all(bind=engine)


app.include_router(profile.router, prefix="/profile", tags=["profile"])
app.include_router(body_logs.router, prefix="/body-logs", tags=["body-logs"])
app.include_router(meal_logs.router, prefix="/meal-logs", tags=["meal-logs"])
app.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
app.include_router(workouts.router, prefix="/workouts", tags=["workouts"])


@app.get("/")
def root():
    return {"status": "ok"}
