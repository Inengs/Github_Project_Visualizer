from __future__ import annotations

from datetime import datetime
from typing import AsyncGenerator

from fastapi import HTTPException
from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, UniqueConstraint, func, select
from sqlalchemy.ext.asyncio import AsyncEngine, AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy.types import JSON

from app.config import DATABASE_URL

# Base class for all SQLAlchemy ORM models.
# All table definitions inherit from this.
class Base(DeclarativeBase):
    pass


class RepositorySnapshot(Base):
    """
    Stores a point-in-time snapshot of a GitHub repository's stats.
 
    Every time a repo is fetched via GET /api/repo/{owner}/{repo},
    a new row is inserted here. This allows the analytics endpoint
    to compare the latest snapshot against the previous one to
    calculate deltas (e.g. how many stars were gained).
    """

    __tablename__ = "repository_snapshots"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)

    # The GitHub repo owner (username or org) and repo name.
    # Indexed for fast lookups when querying snapshots for a specific repo.
    owner: Mapped[str] = mapped_column(String(255), index=True)
    repo: Mapped[str] = mapped_column(String(255), index=True)

    # Repo metadata captured at the time of the snapshot.
    name: Mapped[str] = mapped_column(String(255))
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    stars: Mapped[int] = mapped_column(Integer, nullable=False)
    forks: Mapped[int] = mapped_column(Integer, nullable=False)
    language: Mapped[str | None] = mapped_column(String(255), nullable=True)

    # Stored as a JSON array of strings e.g. ["python", "fastapi"].
    topics: Mapped[list[str]] = mapped_column(JSON, nullable=False, default=list)

    # Timestamp set automatically by the database when the row is inserted.
    # Indexed so we can efficiently order snapshots by time.
    fetched_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        index=True,
    )


class User(Base):
    """
    Local user row after GitHub OAuth. Stores the user's GitHub access token
    so API calls can use it for private repositories (repo scope).
    """

    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    github_id: Mapped[int] = mapped_column(Integer, unique=True, index=True, nullable=False)
    login: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    github_access_token: Mapped[str] = mapped_column(Text, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )


class FavoriteRepo(Base):
    """Per-user saved repositories (requires login)."""

    __tablename__ = "favorite_repos"
    __table_args__ = (UniqueConstraint("user_id", "owner", "repo", name="uq_favorite_user_repo"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    owner: Mapped[str] = mapped_column(String(255), nullable=False)
    repo: Mapped[str] = mapped_column(String(255), nullable=False)


# Create the async engine once at module load time.
# If DATABASE_URL is not set, the engine is None and all DB operations are skipped.
_engine: AsyncEngine | None = (
    create_async_engine(DATABASE_URL, pool_pre_ping=True, future=True) if DATABASE_URL else None
)

# Session factory bound to the engine.
# expire_on_commit=False keeps ORM objects usable after a session commits.
_sessionmaker: async_sessionmaker[AsyncSession] | None = (
    async_sessionmaker(bind=_engine, expire_on_commit=False) if _engine is not None else None
)


async def init_db() -> None:
    """
    Creates all database tables on startup if they don't already exist.
    Called from main.py's startup event.
    Does nothing if DATABASE_URL is not configured.
    """
    if _engine is None:
        return

    async with _engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    """
    FastAPI dependency that yields a database session per request.
    The session is automatically closed when the request finishes.
 
    Raises RuntimeError if DATABASE_URL is not set, since routes
    that depend on this function require a working database.
    """
    if _sessionmaker is None:
        raise RuntimeError("Database is not configured (set DATABASE_URL).")

    async with _sessionmaker() as session:
        yield session


async def get_optional_session() -> AsyncGenerator[AsyncSession | None, None]:
    """Yields None when DATABASE_URL is unset so public routes can skip JWT user lookup."""
    if _sessionmaker is None:
        yield None
        return
    async with _sessionmaker() as session:
        yield session


async def get_session_required() -> AsyncGenerator[AsyncSession, None]:
    """Same as get_session but returns HTTP 503 instead of raising RuntimeError (for API responses)."""
    if _sessionmaker is None:
        raise HTTPException(status_code=503, detail="Database is not configured (set DATABASE_URL).")
    async with _sessionmaker() as session:
        yield session


async def repo_snapshot_exists(owner: str, repo: str) -> bool:
    """
    Returns True if at least one snapshot exists for the given repo.
    Not currently used by any route — available for future use.
    """
    if _sessionmaker is None:
        return False

    async with _sessionmaker() as session:
        stmt = select(func.count()).select_from(RepositorySnapshot).where(
            RepositorySnapshot.owner == owner,
            RepositorySnapshot.repo == repo,
        )
        result = await session.execute(stmt)
        return bool(result.scalar_one())

