from __future__ import annotations

from pydantic import BaseModel, Field


class OAuthTokenResponse(BaseModel):
    """Returned after successful GitHub OAuth (JSON body or redirect query)."""

    access_token: str = Field(description="App JWT for Authorization: Bearer")
    token_type: str = Field(default="bearer")
    github_login: str | None = Field(default=None, description="GitHub username after login")
