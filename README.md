# FastAPI OAuth Client (Laravel Provider)

This project acts like your Laravel client app, but in FastAPI.

## 1) Install

```powershell
cd D:\Work\USA\new_dev_ai\fastapi-oauth-client
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

## 2) Configure

- `.env` is already created with your credentials.
- Make sure the OAuth client on the Laravel main site allows this redirect URI:
  - `http://localhost:8002/oauth/callback`

## 3) Run on port 8002

```powershell
uvicorn app.main:app --host 0.0.0.0 --port 8002 --reload
```

## 4) Test flow

- Open `http://localhost:8002`
- Click **Login with Main Site**
- Authenticate on main site
- You should be redirected back to FastAPI and see user/token session data.
