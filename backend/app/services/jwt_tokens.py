from __future__ import annotations

import time

import jwt

from app.config import JWT_ALGORITHM, JWT_EXPIRE_SECONDS, JWT_SECRET


def create_app_jwt(*, user_id: int, github_login: str | None) -> str:
    if not JWT_SECRET:
        raise RuntimeError("JWT_SECRET is not configured")
    now = int(time.time())
    payload: dict = {
        "sub": str(user_id),
        "iat": now,
        "exp": now + JWT_EXPIRE_SECONDS,
    }
    if github_login:
        payload["login"] = github_login
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def decode_app_jwt(token: str) -> dict:
    if not JWT_SECRET:
        raise jwt.InvalidTokenError("JWT_SECRET is not configured")
    return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
