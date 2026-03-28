from __future__ import annotations

from typing import Any

import httpx

from app.config import GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, GITHUB_OAUTH_CALLBACK_URL


async def exchange_code_for_token(code: str) -> str:
    """Exchange GitHub OAuth authorization code for an access token."""
    if not GITHUB_CLIENT_ID or not GITHUB_CLIENT_SECRET or not GITHUB_OAUTH_CALLBACK_URL:
        raise RuntimeError("GitHub OAuth is not fully configured")

    async with httpx.AsyncClient(timeout=20.0) as client:
        resp = await client.post(
            "https://github.com/login/oauth/access_token",
            headers={"Accept": "application/json"},
            data={
                "client_id": GITHUB_CLIENT_ID,
                "client_secret": GITHUB_CLIENT_SECRET,
                "code": code,
                "redirect_uri": GITHUB_OAUTH_CALLBACK_URL,
            },
        )
        resp.raise_for_status()
        data: Any = resp.json()
        if not isinstance(data, dict):
            raise ValueError("Unexpected token response")
        token = data.get("access_token")
        if not isinstance(token, str) or not token:
            err = data.get("error_description") or data.get("error") or "No access_token in response"
            raise ValueError(str(err))
        return token


async def fetch_github_user_profile(github_access_token: str) -> dict[str, Any]:
    async with httpx.AsyncClient(timeout=20.0) as client:
        resp = await client.get(
            "https://api.github.com/user",
            headers={
                "Accept": "application/vnd.github+json",
                "Authorization": f"Bearer {github_access_token}",
                "User-Agent": "github-project-visualizer",
                "X-GitHub-Api-Version": "2022-11-28",
            },
        )
        resp.raise_for_status()
        data = resp.json()
        if not isinstance(data, dict):
            raise ValueError("Unexpected /user response")
        return data
