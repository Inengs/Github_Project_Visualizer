from __future__ import annotations

from pydantic import BaseModel

from app.schemas.repo import RepoResponse


class RepoAnalyticsResponse(BaseModel):
    """
    Analytics data for a repository, derived from stored snapshots.
 
    Compares the two most recent snapshots to show how the repo has
    changed over time (e.g. how many stars or forks were gained).
 
    Returned by GET /api/analytics/repo/{owner}/{repo}.
    """
    owner: str
    repo: str
    # The most recently stored snapshot for this repo.
    latest: RepoResponse

    # The snapshot before the latest one.
    # None if only one snapshot exists (i.e. the repo was fetched for the first time).
    previous: RepoResponse | None = None

    # Difference in stars between latest and previous snapshot.
    # 0 if there is no previous snapshot to compare against.
    stars_delta: int

    
    # Difference in forks between latest and previous snapshot.
    # 0 if there is no previous snapshot to compare against.
    forks_delta: int

