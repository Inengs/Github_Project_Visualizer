from __future__ import annotations

from pydantic import BaseModel, Field


class FavoriteCreate(BaseModel):
    owner: str = Field(min_length=1, max_length=255)
    repo: str = Field(min_length=1, max_length=255)


class FavoriteItem(BaseModel):
    owner: str
    repo: str
