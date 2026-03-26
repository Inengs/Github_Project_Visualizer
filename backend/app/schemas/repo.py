from __future__ import annotations

from pydantic import BaseModel


class RepoResponse(BaseModel):
    name: str
    description: str | None = None
    stars: int
    forks: int
    language: str | None = None
    topics: list[str]

