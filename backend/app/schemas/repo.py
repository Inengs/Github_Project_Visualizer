from __future__ import annotations


from typing import Optional
from pydantic import BaseModel, ConfigDict, Field,HttpUrl


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

class ContributorResponse(BaseModel):
    """
    Normalized contributor row from GitHub GET /repos/{owner}/{repo}/contributors.
    Extra upstream fields are ignored so the public API stays stable.
    """

    model_config = ConfigDict(extra="ignore")

    login: str
    id: int = 0
    avatar_url: str | None = None
    html_url: str | None = None
    contributions: int = Field(default=0, ge=0)

