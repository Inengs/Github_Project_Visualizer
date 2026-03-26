from __future__ import annotations

from fastapi import APIRouter, HTTPException

from app.schemas.analytics import RepoAnalyticsResponse
from app.services.repository_analytics import get_repo_analytics

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

