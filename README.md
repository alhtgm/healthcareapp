# Healthcare App

React + FastAPI で作成した、筋トレ/栄養/身体データを一元管理するフルスタックアプリです。

## Features
- プロフィール設定（年齢・身長・活動量・目標）
- BMR / TDEE / 推奨摂取カロリーの算出
- 身体ログ（体重・体脂肪率・睡眠）
- 食事ログ（カロリー・タンパク質）
- ワークアウトメニュー作成と当日セット記録
- ダッシュボードで推移の可視化

## Tech Stack
- Frontend: React, TypeScript, MUI, Recharts
- Backend: FastAPI, SQLAlchemy, Pydantic
- DB: SQLite
- Deploy: Docker, Docker Compose

## Quick Start (Docker)
最短で動かす場合はこちら。

```bash
docker compose up -d --build
```

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000`

停止:

```bash
docker compose down
```

## Local Development

### Backend
```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r backend/requirements.txt
cd backend
uvicorn app.main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm start
```

## Environment Variables

### Frontend
- `REACT_APP_API_BASE_URL` (default: `http://localhost:8000`)

### Backend
- `DATABASE_URL` (default: `sqlite:///./healthcare.db`)
- `CORS_ORIGINS` (default: `*`)

サンプルは `.env.deploy.example` を参照してください。

## Testing

```bash
cd backend
pytest -q
```

## API Overview
主なエンドポイント:
- `GET /profile`, `PUT /profile`
- `GET /profile/compute`
- `GET/POST/DELETE /body-logs`
- `GET/POST/PUT/DELETE /meal-logs`
- `GET /dashboard/summary`
- `GET/POST/PUT/DELETE /workouts/templates`
- `GET/POST/DELETE /workouts/sessions`

## Project Structure
```text
healthcareapp/
  backend/     # FastAPI app
  frontend/    # React app
  docker-compose.yml
```

## Notes
- このリポジトリは学習・プロトタイプ用途です。
- 本番利用時は認証・権限管理・入力バリデーション強化を推奨します。
