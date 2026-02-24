# healthcareapp backend

簡易的な FastAPI backend の雛形です。

セットアップ

```bash
python -m venv .venv
source .venv/Scripts/activate   # Windows: .venv\Scripts\activate
pip install -r backend/requirements.txt
cd backend
uvicorn app.main:app --reload --port 8000
```

初回起動時に `healthcare.db` が作られ、`/profile` エンドポイント（GET/PUT）と `/profile/compute` が使えます。

Alembic:

To generate an initial migration (after first run) from the models:

```bash
cd backend
alembic revision --autogenerate -m "init"
alembic upgrade head
```

Note: Alembic must be configured in the environment; `alembic.ini` and `alembic/env.py` are included as a scaffold.
