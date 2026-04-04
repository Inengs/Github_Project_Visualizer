from __future__ import annotations

from pydantic import BaseModel, Field, model_validator


class RepoRef(BaseModel):
    """Single repository identifier in compare requests."""

    owner: str
    repo: str


class CompareReposRequest(BaseModel):
    """POST /analytics/compare/repos body: two or three repositories."""

    repos: list[RepoRef] = Field(min_length=2, max_length=3)

    @model_validator(mode="after")
    def strip_names(self) -> CompareReposRequest:
        self.repos = [RepoRef(owner=r.owner.strip(), repo=r.repo.strip()) for r in self.repos]
        return self


class RepoCompareRow(BaseModel):
    """One column set in the compare table (live GitHub + derived insight fields)."""

    owner: str
    repo: str
    full_name: str
    stars: int
    forks: int
    language: str | None
    open_issues_count: int
    repo_health_score: int
    activity_trend: str
    merge_rate: float
    stars_delta_snapshot: int
    forks_delta_snapshot: int
    high_impact_preview: str


class CompareReposResponse(BaseModel):
    rows: list[RepoCompareRow]
