# Backend (FastAPI)

`backend/` は Healthcare App のAPIサーバーです。

## Setup

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r backend/requirements.txt
cd backend
uvicorn app.main:app --reload --port 8000
```

初回起動時に `healthcare.db` が生成されます。

## Main Endpoints
- `GET /profile`, `PUT /profile`
- `GET /profile/compute`
- `GET/POST/DELETE /body-logs`
- `GET/POST/PUT/DELETE /meal-logs`
- `GET /dashboard/summary`
- `GET/POST/PUT/DELETE /workouts/templates`
- `GET/POST/DELETE /workouts/sessions`

## Migration (Alembic)

```bash
cd backend
alembic revision --autogenerate -m "init"
alembic upgrade head
```

`alembic.ini` と `alembic/env.py` は同梱済みです。

## Test

```bash
cd backend
pytest -q
```
