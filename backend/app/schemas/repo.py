from __future__ import annotations

from pydantic import BaseModel


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

