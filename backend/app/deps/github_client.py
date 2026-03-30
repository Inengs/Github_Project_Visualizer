from __future__ import annotations

from collections.abc import AsyncGenerator
from typing import Annotated

import jwt
from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import GITHUB_TOKEN
from app.db import User, get_optional_session, get_session_required
from app.services.github import GitHubClient
from app.services.jwt_tokens import decode_app_jwt

_http_bearer_optional = HTTPBearer(auto_error=False)


async def resolve_github_api_token(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(_http_bearer_optional)],
    db: Annotated[AsyncSession | None, Depends(get_optional_session)],
) -> str | None:
    """
    Token used for GitHub REST calls: logged-in user's OAuth token (can access
    private repos if `repo` scope was granted), else server `GITHUB_TOKEN`.
    """
    if credentials and credentials.credentials and db is not None:
        try:
            payload = decode_app_jwt(credentials.credentials)
            uid = int(payload["sub"])
        except (jwt.PyJWTError, KeyError, TypeError, ValueError):
            return GITHUB_TOKEN
        user = await db.get(User, uid)
        if user is not None and user.github_access_token:
            return user.github_access_token
    return GITHUB_TOKEN


async def get_github_client(
    token: Annotated[str | None, Depends(resolve_github_api_token)],
) -> AsyncGenerator[GitHubClient, None]:
    async with GitHubClient(token=token) as client:
        yield client


_http_bearer_required = HTTPBearer(auto_error=True)


async def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(_http_bearer_required)],
    db: Annotated[AsyncSession, Depends(get_session_required)],
) -> User:
    try:
        payload = decode_app_jwt(credentials.credentials)
        uid = int(payload["sub"])
    except (jwt.PyJWTError, KeyError, TypeError, ValueError) as e:
        raise HTTPException(status_code=401, detail="Invalid or expired token") from e
    user = await db.get(User, uid)
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return user
