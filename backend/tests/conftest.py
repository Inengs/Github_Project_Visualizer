"""
Shared pytest fixtures for the FastAPI backend.

Repository snapshot tests patch `get_session` on the analytics and store modules so they
talk to a throwaway SQLite database instead of the app’s global engine (which often has
no DATABASE_URL during CI/local pytest runs).
"""
from __future__ import annotations

from collections.abc import AsyncGenerator

import pytest
import pytest_asyncio
from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from app.db import Base


@pytest_asyncio.fixture
async def memory_engine() -> AsyncGenerator[AsyncEngine, None]:
    """Fresh async engine + schema (all ORM tables) for each test function."""
    engine = create_async_engine("sqlite+aiosqlite:///:memory:", future=True)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield engine
    await engine.dispose()


@pytest_asyncio.fixture
async def patch_get_session(
    memory_engine: AsyncEngine,
    monkeypatch: pytest.MonkeyPatch,
) -> AsyncGenerator[AsyncEngine, None]:
    """
    Route repository_analytics and repository_store through an in-memory SQLite DB
    instead of app.db’s process-wide engine (which may be unset in tests).
    """
    session_factory = async_sessionmaker(memory_engine, expire_on_commit=False)

    # Same async-generator shape as app.db.get_session (one session per consumer).
    async def get_session() -> AsyncGenerator[AsyncSession, None]:
        async with session_factory() as session:
            yield session

    # Both modules bind get_session at import time; patch each module’s reference.
    monkeypatch.setattr(
        "app.services.repository_analytics.get_session",
        get_session,
    )
    monkeypatch.setattr(
        "app.services.repository_store.get_session",
        get_session,
    )
    yield memory_engine
