from __future__ import annotations

from typing import Any

import httpx
from fastapi import APIRouter, Depends, HTTPException

from app.schemas.repo import RepoResponse
from app.services.github import GitHubApiError, GitHubClient
from app.services.repository_store import save_repo_snapshot
from app.dependencies import get_github_client

router = APIRouter(prefix="/repo", tags=["repo"])


@router.get("/{owner}/{repo}", response_model=RepoResponse)
async def get_repo(
    owner: str,
    repo: str,
    gh: GitHubClient = Depends(get_github_client),
) -> RepoResponse:
    """
    Fetches live repository data from the GitHub API and saves a snapshot to the database.
 
    - owner: GitHub username or organisation (e.g. "torvalds")
    - repo:  Repository name (e.g. "linux")
 
    On success, saves the result as a RepositorySnapshot so the analytics
    endpoint can track changes over time.
 
    Raises:
    - 404/502 if GitHub returns an error (e.g. repo not found, rate limited)
    - 502 if the network request itself fails
    """
    try:
        payload: Any = await gh.request_json("GET", f"/repos/{owner}/{repo}")
    except GitHubApiError as e:
        # Use the status code from GitHub's response if available, otherwise 502
        status = e.status_code or 502
        raise HTTPException(status_code=status, detail=e.message) from e
    except httpx.HTTPError as e:
        raise HTTPException(status_code=502, detail=str(e)) from e

    # GitHub should always return a dict here, but guard against unexpected shapes
    if not isinstance(payload, dict):
        raise HTTPException(status_code=502, detail="Unexpected GitHub response shape")

    # Safely extract topics — GitHub returns an empty list if none are set,
    # but we guard against None or non-list values just in case.
    topics = payload.get("topics")
    if not isinstance(topics, list):
        topics = []
    topics = [t for t in topics if isinstance(t, str)]

    result = RepoResponse(
        name=str(payload.get("name") or ""),
        # description and language can legitimately be None (not set on the repo)
        description=payload.get("description") if isinstance(payload.get("description"), str) else None,
        stars=int(payload.get("stargazers_count") or 0),
        forks=int(payload.get("forks_count") or 0),
        language=payload.get("language") if isinstance(payload.get("language"), str) else None,
        topics=topics,
    )

    # Persist this snapshot to the database so analytics can compare it
    # against future fetches of the same repo.
    await save_repo_snapshot(owner, repo, result)
    return result

