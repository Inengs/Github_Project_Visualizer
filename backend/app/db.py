from __future__ import annotations

from datetime import datetime
from typing import AsyncGenerator

from sqlalchemy import DateTime, Integer, String, Text, func, select
from sqlalchemy.ext.asyncio import AsyncEngine, AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy.types import JSON

from app.config import DATABASE_URL


class Base(DeclarativeBase):
    pass


class RepositorySnapshot(Base):
    __tablename__ = "repository_snapshots"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    owner: Mapped[str] = mapped_column(String(255), index=True)
    repo: Mapped[str] = mapped_column(String(255), index=True)

    name: Mapped[str] = mapped_column(String(255))
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    stars: Mapped[int] = mapped_column(Integer, nullable=False)
    forks: Mapped[int] = mapped_column(Integer, nullable=False)
    language: Mapped[str | None] = mapped_column(String(255), nullable=True)
    topics: Mapped[list[str]] = mapped_column(JSON, nullable=False, default=list)

    fetched_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        index=True,
    )


_engine: AsyncEngine | None = (
    create_async_engine(DATABASE_URL, pool_pre_ping=True, future=True) if DATABASE_URL else None
)
_sessionmaker: async_sessionmaker[AsyncSession] | None = (
    async_sessionmaker(bind=_engine, expire_on_commit=False) if _engine is not None else None
)


async def init_db() -> None:
    """Create DB tables if `DATABASE_URL` is configured."""
    if _engine is None:
        return

    async with _engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    if _sessionmaker is None:
        raise RuntimeError("Database is not configured (set DATABASE_URL).")

    async with _sessionmaker() as session:
        yield session


async def repo_snapshot_exists(owner: str, repo: str) -> bool:
    """Utility for future checks; not currently used by routes."""
    if _sessionmaker is None:
        return False

    async with _sessionmaker() as session:
        stmt = select(func.count()).select_from(RepositorySnapshot).where(
            RepositorySnapshot.owner == owner,
            RepositorySnapshot.repo == repo,
        )
        result = await session.execute(stmt)
        return bool(result.scalar_one())

