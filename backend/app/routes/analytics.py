from __future__ import annotations

import httpx
from fastapi import APIRouter, Depends, HTTPException

from app.schemas.analytics import RepoAnalyticsResponse
from app.schemas.insights import InsightsSummaryResponse
from app.services.github import GitHubApiError, GitHubClient
from app.services.insights import build_insights_summary
from app.services.repository_analytics import get_repo_analytics
from app.dependencies import get_github_client

router = APIRouter(prefix="/analytics", tags=["analytics"])



@router.get("/repo/{owner}/{repo}", response_model=RepoAnalyticsResponse)
async def repo_analytics(owner: str, repo: str) -> RepoAnalyticsResponse:
    """
    Returns analytics for a repository based on stored snapshots.
 
    Reads the two most recent snapshots from the database and computes
    the difference in stars and forks between them (stars_delta, forks_delta).
 
    Note: This endpoint does NOT call the GitHub API — it only reads from
    the database. To get fresh data, hit GET /api/repo/{owner}/{repo} first,
    which saves a new snapshot.
 
    Raises:
    - 404 if no snapshots exist yet for this repo (i.e. it has never been fetched)
    """
    analytics = await get_repo_analytics(owner, repo)
    if analytics is None:
        raise HTTPException(status_code=404, detail="No stored repository snapshots for this repo yet.")
    return analytics


@router.get("/repo/{owner}/{repo}/insights", response_model=InsightsSummaryResponse)
async def repo_insights(
    owner: str,
    repo: str,
    gh: GitHubClient = Depends(get_github_client),
) -> InsightsSummaryResponse:
    # Insights depend on stored trend context (stars_delta), so require
    # at least one fetched snapshot from /api/repo/{owner}/{repo}.
    analytics = await get_repo_analytics(owner, repo)
    if analytics is None:
        raise HTTPException(
            status_code=404,
            detail="No stored repository snapshots for this repo yet. Fetch /api/repo/{owner}/{repo} first.",
        )

    try:
        # Combine DB trend data with live GitHub signals (issues/PRs).
        return await build_insights_summary(owner, repo, github_client=gh, stars_delta=analytics.stars_delta)
    except GitHubApiError as e:
        raise HTTPException(status_code=e.status_code or 502, detail=e.message) from e
    except httpx.HTTPError as e:
        raise HTTPException(status_code=502, detail=str(e)) from e

