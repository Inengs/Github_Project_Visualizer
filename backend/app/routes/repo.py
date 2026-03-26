from __future__ import annotations

from collections.abc import AsyncGenerator
from typing import Any

import httpx
from fastapi import APIRouter, Depends, HTTPException

from app.schemas.repo import RepoResponse
from app.services.github import GitHubApiError, GitHubClient
from app.services.repository_store import save_repo_snapshot

router = APIRouter(prefix="/repo", tags=["repo"])


async def get_github_client() -> AsyncGenerator[GitHubClient, None]:
    async with GitHubClient() as client:
        yield client


@router.get("/{owner}/{repo}", response_model=RepoResponse)
async def get_repo(
    owner: str,
    repo: str,
    gh: GitHubClient = Depends(get_github_client),
) -> RepoResponse:
    try:
        payload: Any = await gh.request_json("GET", f"/repos/{owner}/{repo}")
    except GitHubApiError as e:
        status = e.status_code or 502
        raise HTTPException(status_code=status, detail=e.message) from e
    except httpx.HTTPError as e:
        raise HTTPException(status_code=502, detail=str(e)) from e

    if not isinstance(payload, dict):
        raise HTTPException(status_code=502, detail="Unexpected GitHub response shape")

    topics = payload.get("topics")
    if not isinstance(topics, list):
        topics = []
    topics = [t for t in topics if isinstance(t, str)]

    result = RepoResponse(
        name=str(payload.get("name") or ""),
        description=payload.get("description") if isinstance(payload.get("description"), str) else None,
        stars=int(payload.get("stargazers_count") or 0),
        forks=int(payload.get("forks_count") or 0),
        language=payload.get("language") if isinstance(payload.get("language"), str) else None,
        topics=topics,
    )
    await save_repo_snapshot(owner, repo, result)
    return result

