from __future__ import annotations


from pydantic import BaseModel, ConfigDict, Field


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

