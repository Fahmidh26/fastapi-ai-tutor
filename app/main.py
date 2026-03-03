from __future__ import annotations

import os
import secrets
from pathlib import Path
from urllib.parse import urlencode

import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse, RedirectResponse
from fastapi.templating import Jinja2Templates
from starlette.middleware.sessions import SessionMiddleware

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / '.env')

app = FastAPI(title='FastAPI OAuth Client')
templates = Jinja2Templates(directory=str(BASE_DIR / 'app' / 'templates'))

SESSION_SECRET_KEY = os.getenv('SESSION_SECRET_KEY', 'change-me')
app.add_middleware(
    SessionMiddleware,
    secret_key=SESSION_SECRET_KEY,
    same_site='lax',
    https_only=False,
)

OAUTH_BASE_URL = os.getenv('AISITE_OAUTH_BASE_URL', 'http://localhost:8000/').rstrip('/')
OAUTH_INTERNAL_URL = os.getenv('AISITE_OAUTH_INTERNAL_URL', OAUTH_BASE_URL).rstrip('/')
OAUTH_CLIENT_ID = os.getenv('AISITE_OAUTH_CLIENT_ID', '')
OAUTH_CLIENT_SECRET = os.getenv('AISITE_OAUTH_CLIENT_SECRET', '')
OAUTH_REDIRECT_URI = os.getenv('AISITE_OAUTH_REDIRECT_URI', 'http://localhost:8002/oauth/callback')


@app.get('/')
async def home(request: Request):
    return templates.TemplateResponse(
        request,
        'index.html',
        {
            'user': request.session.get('user'),
            'access_token': request.session.get('access_token'),
            'oauth_base': OAUTH_BASE_URL,
            'redirect_uri': OAUTH_REDIRECT_URI,
        },
    )


@app.get('/oauth/login')
async def oauth_login(request: Request):
    if not OAUTH_CLIENT_ID or not OAUTH_CLIENT_SECRET:
        return JSONResponse(
            status_code=500,
            content={'error': 'OAuth client credentials are missing in .env'},
        )

    state = secrets.token_urlsafe(32)
    request.session['oauth_state'] = state

    query = urlencode(
        {
            'response_type': 'code',
            'client_id': OAUTH_CLIENT_ID,
            'redirect_uri': OAUTH_REDIRECT_URI,
            'scope': 'basic',
            'state': state,
        }
    )
    authorize_url = f"{OAUTH_BASE_URL}/oauth/authorize?{query}"
    return RedirectResponse(url=authorize_url)


@app.get('/oauth/callback')
async def oauth_callback(request: Request, code: str | None = None, state: str | None = None):
    session_state = request.session.pop('oauth_state', None)
    if not state or not session_state or state != session_state:
        return JSONResponse(status_code=403, content={'error': 'Invalid oauth state'})

    if not code:
        return JSONResponse(status_code=400, content={'error': 'Missing authorization code'})

    token_url = f'{OAUTH_INTERNAL_URL}/api/oauth/token'
    user_url = f'{OAUTH_INTERNAL_URL}/api/user'

    async with httpx.AsyncClient(timeout=15) as client:
        token_response = await client.post(
            token_url,
            data={
                'grant_type': 'authorization_code',
                'client_id': OAUTH_CLIENT_ID,
                'client_secret': OAUTH_CLIENT_SECRET,
                'redirect_uri': OAUTH_REDIRECT_URI,
                'code': code,
            },
        )

        if token_response.status_code >= 400:
            return JSONResponse(
                status_code=token_response.status_code,
                content={
                    'error': 'Token exchange failed',
                    'details': token_response.text,
                },
            )

        token_data = token_response.json()
        access_token = token_data.get('access_token')
        if not access_token:
            return JSONResponse(status_code=500, content={'error': 'No access_token in token response'})

        user_response = await client.get(
            user_url,
            headers={'Authorization': f'Bearer {access_token}', 'Accept': 'application/json'},
        )

        if user_response.status_code >= 400:
            return JSONResponse(
                status_code=user_response.status_code,
                content={
                    'error': 'Failed to fetch user profile',
                    'details': user_response.text,
                },
            )

        provider_user = user_response.json()

    request.session['access_token'] = access_token
    request.session['user'] = provider_user

    return RedirectResponse(url='/')


@app.get('/me')
async def me(request: Request):
    user = request.session.get('user')
    token = request.session.get('access_token')
    if not token:
        return JSONResponse(status_code=401, content={'error': 'Not authenticated'})

    return {'user': user, 'access_token': token}


@app.get('/logout')
async def logout(request: Request):
    request.session.clear()
    return RedirectResponse(url='/')


@app.get('/health')
async def health():
    return {'ok': True}
