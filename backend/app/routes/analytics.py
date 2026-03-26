from __future__ import annotations

from fastapi import APIRouter, HTTPException

from app.schemas.analytics import RepoAnalyticsResponse
from app.services.repository_analytics import get_repo_analytics

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/repo/{owner}/{repo}", response_model=RepoAnalyticsResponse)
async def repo_analytics(owner: str, repo: str) -> RepoAnalyticsResponse:
    analytics = await get_repo_analytics(owner, repo)
    if analytics is None:
        raise HTTPException(status_code=404, detail="No stored repository snapshots for this repo yet.")
    return analytics

