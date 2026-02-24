# Healthcare App (fullstack prototype)

This repository contains a FastAPI backend and a React+TypeScript frontend prototype for a personal health tracking app.

Backend (Python / FastAPI)

1. Create and activate a virtualenv

```bash
python -m venv .venv
.venv\Scripts\activate   # Windows
```

2. Install dependencies and run

```bash
pip install -r backend/requirements.txt
cd backend
uvicorn app.main:app --reload --port 8000
```

The backend will create `healthcare.db` on first run. Endpoints:

- `GET /profile`, `PUT /profile`
- `GET /profile/compute`
- `GET/POST/DELETE /body-logs`
- `GET/POST/PUT/DELETE /meal-logs` and `/meal-logs/range`
- `GET/POST/PUT/DELETE /workouts/templates` and `/workouts/sessions`
- `GET /dashboard/summary`

Frontend (React)

1. Install dependencies

```bash
cd frontend
npm install
npm start
```

The frontend is a minimal skeleton that fetches `/dashboard/summary` and displays JSON. Expand pages under `frontend/src/pages`.

Acceptance checklist

- Fill profile and call `/profile/compute` to verify `TDEE` is returned.
- Add meals and verify 7-day average appears in `/dashboard/summary`.
- Add body logs and verify weight_series in `/dashboard/summary`.

Run tests:

```bash
cd backend
pytest -q
```

## Deploy (Docker)

You can run both frontend and backend in production mode with Docker.

1. Start services

```bash
docker compose up -d --build
```

2. Open app

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000`

3. Stop services

```bash
docker compose down
```

Notes:

- Backend DB is persisted in Docker volume `backend_data`.
- Frontend API endpoint is controlled by `REACT_APP_API_BASE_URL` (build arg).
- Backend CORS is controlled by `CORS_ORIGINS`.
