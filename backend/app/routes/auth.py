from __future__ import annotations

import secrets
from urllib.parse import quote, urlencode

from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import JSONResponse, RedirectResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import (
    FRONTEND_URL,
    GITHUB_CLIENT_ID,
    GITHUB_OAUTH_CALLBACK_URL,
    JWT_SECRET,
)
from app.db import User, get_session_required
from app.schemas.auth import OAuthTokenResponse
from app.services.jwt_tokens import create_app_jwt
from app.services.oauth_github import exchange_code_for_token, fetch_github_user_profile

router = APIRouter(prefix="/auth", tags=["auth"])

_OAUTH_STATE_COOKIE = "gh_oauth_state"
_OAUTH_SCOPES = "read:user user:email repo"


@router.get("/github/login", response_model=None)
async def github_oauth_login() -> RedirectResponse:
    """Redirect browser to GitHub authorize URL (sets CSRF state cookie)."""
    if not GITHUB_CLIENT_ID or not GITHUB_OAUTH_CALLBACK_URL:
        raise HTTPException(status_code=503, detail="GitHub OAuth is not configured (CLIENT_ID / CALLBACK_URL).")
    state = secrets.token_urlsafe(32)
    qs = urlencode(
        {
            "client_id": GITHUB_CLIENT_ID,
            "redirect_uri": GITHUB_OAUTH_CALLBACK_URL,
            "state": state,
            "scope": _OAUTH_SCOPES,
        }
    )
    redir = RedirectResponse(url=f"https://github.com/login/oauth/authorize?{qs}", status_code=302)
    redir.set_cookie(
        key=_OAUTH_STATE_COOKIE,
        value=state,
        max_age=600,
        httponly=True,
        samesite="lax",
    )
    return redir


@router.get("/github/callback", response_model=None)
async def github_oauth_callback(
    request: Request,
    code: str,
    state: str,
    db: AsyncSession = Depends(get_session_required),
) -> RedirectResponse | JSONResponse:
    """GitHub redirects here with `code`; we exchange it and issue an app JWT."""
    if not JWT_SECRET:
        raise HTTPException(status_code=503, detail="JWT_SECRET is not configured.")

    cookie_state = request.cookies.get(_OAUTH_STATE_COOKIE)
    if not cookie_state or cookie_state != state:
        raise HTTPException(status_code=400, detail="Invalid or missing OAuth state.")

    try:
        gh_token = await exchange_code_for_token(code)
        profile = await fetch_github_user_profile(gh_token)
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e)) from e
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"OAuth exchange failed: {e}") from e

    github_id = profile.get("id")
    login = profile.get("login")
    if not isinstance(github_id, int) or not isinstance(login, str):
        raise HTTPException(status_code=502, detail="Unexpected GitHub user profile.")

    result = await db.execute(select(User).where(User.github_id == github_id))
    user = result.scalar_one_or_none()
    if user is None:
        user = User(github_id=github_id, login=login, github_access_token=gh_token)
        db.add(user)
    else:
        user.login = login
        user.github_access_token = gh_token
    await db.commit()
    await db.refresh(user)

    app_jwt = create_app_jwt(user_id=user.id, github_login=user.login)

    if FRONTEND_URL:
        base = FRONTEND_URL.rstrip("/")
        fragment_url = f"{base}/auth/callback#access_token={quote(app_jwt, safe='')}"
        redirect = RedirectResponse(url=fragment_url, status_code=302)
        redirect.delete_cookie(_OAUTH_STATE_COOKIE)
        return redirect

    body = JSONResponse(
        content=OAuthTokenResponse(access_token=app_jwt, github_login=user.login).model_dump(),
        status_code=200,
    )
    body.delete_cookie(_OAUTH_STATE_COOKIE)
    return body
