from __future__ import annotations

from typing import Any

import httpx
from fastapi import APIRouter, Depends, HTTPException, Response

from app.deps.github_client import get_github_client
from app.services.github import GitHubApiError, GitHubClient
from app.services.github_cache import get_json_cached

router = APIRouter(tags=["rate-limit"])


@router.get("/rate-limit")
async def get_rate_limit(
    response: Response,
    gh: GitHubClient = Depends(get_github_client),
) -> Any:
    """Proxies GitHub `GET /rate_limit` (see openapi.yaml). Cached like other GitHub GETs when Redis is on."""
    try:
        return await get_json_cached(
            gh=gh,
            path="/rate_limit",
            params=None,
            token=gh.access_token,
            response=response,
        )
    except GitHubApiError as e:
        raise HTTPException(status_code=e.status_code or 502, detail=e.message) from e
    except httpx.HTTPError as e:
        raise HTTPException(status_code=502, detail=str(e)) from e
