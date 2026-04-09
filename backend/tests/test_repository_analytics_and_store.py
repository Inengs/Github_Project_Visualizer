"""
Tests for `get_repo_analytics` and `save_repo_snapshot`.

Depends on `patch_get_session` (see tests/conftest.py) for an isolated in-memory DB.
"""
from __future__ import annotations

import pytest
from sqlalchemy import select

from app.db import RepositorySnapshot
from app.schemas.repo import RepoResponse
import app.services.repository_analytics as repository_analytics
from app.services.repository_analytics import get_repo_analytics
from app.services.repository_store import save_repo_snapshot


@pytest.mark.asyncio
async def test_get_repo_analytics_returns_none_when_no_snapshots(patch_get_session) -> None:
    """No rows for owner/repo → analytics helper returns None (not an error)."""
    result = await get_repo_analytics("acme", "nonexistent-repo")
    assert result is None


@pytest.mark.asyncio
async def test_get_repo_analytics_computes_stars_and_forks_delta_between_two_snapshots(
    patch_get_session,
) -> None:
    """Latest vs previous snapshot: stars_delta and forks_delta match inserted values."""
    older = RepoResponse(
        name="demo",
        description="old",
        stars=100,
        forks=5,
        language="Python",
        topics=["api"],
    )
    newer = RepoResponse(
        name="demo",
        description="new",
        stars=115,
        forks=9,
        language="Python",
        topics=["api", "web"],
    )
    await save_repo_snapshot("acme", "demo", older)
    await save_repo_snapshot("acme", "demo", newer)

    result = await get_repo_analytics("acme", "demo")
    assert result is not None
    assert result.owner == "acme"
    assert result.repo == "demo"
    assert result.stars_delta == 15
    assert result.forks_delta == 4
    assert result.latest.stars == 115
    assert result.latest.forks == 9
    assert result.previous is not None
    assert result.previous.stars == 100
    assert result.previous.forks == 5


@pytest.mark.asyncio
async def test_save_repo_snapshot_persists_row(patch_get_session) -> None:
    """save_repo_snapshot commits one RepositorySnapshot row with expected columns."""
    payload = RepoResponse(
        name="my-app",
        description="A test repo",
        stars=42,
        forks=7,
        language="Rust",
        topics=["cli", "tools"],
    )
    await save_repo_snapshot("org", "my-app", payload)

    # Read back through the same patched session factory the services use.
    async for session in repository_analytics.get_session():
        row = (
            await session.execute(
                select(RepositorySnapshot).where(
                    RepositorySnapshot.owner == "org",
                    RepositorySnapshot.repo == "my-app",
                )
            )
        ).scalar_one()
        assert row.name == "my-app"
        assert row.description == "A test repo"
        assert row.stars == 42
        assert row.forks == 7
        assert row.language == "Rust"
        assert row.topics == ["cli", "tools"]
        break
