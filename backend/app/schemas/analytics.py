from __future__ import annotations

from pydantic import BaseModel

from app.schemas.repo import RepoResponse


class RepoAnalyticsResponse(BaseModel):
    owner: str
    repo: str
    latest: RepoResponse
    previous: RepoResponse | None = None
    stars_delta: int
    forks_delta: int

