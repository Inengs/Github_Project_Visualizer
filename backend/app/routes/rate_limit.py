from __future__ import annotations

from typing import Any

import httpx
from fastapi import APIRouter, Depends, HTTPException

from app.deps.github_client import get_github_client
from app.services.github import GitHubApiError, GitHubClient

router = APIRouter(tags=["rate-limit"])


@router.get("/rate-limit")
async def get_rate_limit(gh: GitHubClient = Depends(get_github_client)) -> Any:
    """Proxies GitHub `GET /rate_limit` (see openapi.yaml)."""
    try:
        return await gh.request_json("GET", "/rate_limit")
    except GitHubApiError as e:
        raise HTTPException(status_code=e.status_code or 502, detail=e.message) from e
    except httpx.HTTPError as e:
        raise HTTPException(status_code=502, detail=str(e)) from e
