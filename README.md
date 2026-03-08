# FastAPI + React OAuth Client

FastAPI handles OAuth and session state. React handles the UI.

## 1) Backend install

```powershell
cd D:\USA\fastapi-ai-tutor
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

## 2) Frontend install

```powershell
cd D:\USA\fastapi-ai-tutor\frontend
npm install
```

## 3) Configure

- `.env` must include OAuth credentials (already present in your local setup).
- OAuth provider redirect URI should be:
  - `http://localhost:8002/oauth/callback`
- Optional backend vars:
  - `FRONTEND_URL=http://localhost:5173`
  - `FRONTEND_POST_LOGIN_PATH=/auth/callback`
  - `ALLOW_ORIGINS=http://localhost:5173`

## 4) Run backend (port 8002)

```powershell
cd D:\USA\fastapi-ai-tutor
.\.venv\Scripts\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8002 --reload
```

## 5) Run frontend (port 5173)

```powershell
cd D:\USA\fastapi-ai-tutor\frontend
npm run dev
```

## 6) Test flow

- Open `http://localhost:5173`
- Click **Login with Main Site**
- Authenticate on your OAuth provider
- You will return to React, which fetches session data from FastAPI (`/api/me`)

## Docker (one command for both)

```powershell
cd D:\USA\fastapi-ai-tutor
docker compose up --build
```

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8002`
- Stop services: `Ctrl + C` then `docker compose down`

Notes:
- Compose mounts your source code for hot reload.
- Backend container uses `AISITE_OAUTH_INTERNAL_URL=http://host.docker.internal:8000/` so it can call an OAuth provider running on your host machine.
