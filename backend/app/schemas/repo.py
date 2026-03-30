from __future__ import annotations

from pydantic import BaseModel, HttpUrl
from typing import Optional


class RepoResponse(BaseModel):
    """
    The shape of data returned for a single GitHub repository.
 
    This is both the API response model for GET /api/repo/{owner}/{repo}
    and the unit stored inside each RepositorySnapshot in the database.
    """
    
    name: str
    description: str | None = None
    stars: int
    forks: int
    language: str | None = None
    topics: list[str]

class ContributorBase(BaseModel):
    username: str
    avatar_url: HttpUrl
    profile_url: HttpUrl
    contributions: int
    additions = Optional[int] = None
    deletions = Optional[int] = None
    commits = Optional[int] = None

class ContributorResponse(ContributorBase):
    owner: str
    repo: str
    total_contributors: int
    contributors: list[ContributorBase]
