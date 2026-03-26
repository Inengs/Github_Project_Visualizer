from __future__ import annotations

from sqlalchemy import select

from app.db import RepositorySnapshot, get_session
from app.schemas.analytics import RepoAnalyticsResponse
from app.schemas.repo import RepoResponse


async def get_repo_analytics(owner: str, repo: str) -> RepoAnalyticsResponse | None:
    """
    Compute basic analytics from stored repo snapshots.
    """
    try:
        async for session in get_session():
            latest_stmt = (
                select(RepositorySnapshot)
                .where(RepositorySnapshot.owner == owner, RepositorySnapshot.repo == repo)
                .order_by(RepositorySnapshot.fetched_at.desc(), RepositorySnapshot.id.desc())
                .limit(1)
            )
            latest_row = (await session.execute(latest_stmt)).scalar_one_or_none()
            if latest_row is None:
                return None

            previous_stmt = (
                select(RepositorySnapshot)
                .where(RepositorySnapshot.owner == owner, RepositorySnapshot.repo == repo)
                .order_by(RepositorySnapshot.fetched_at.desc(), RepositorySnapshot.id.desc())
                .offset(1)
                .limit(1)
            )
            previous_row = (await session.execute(previous_stmt)).scalar_one_or_none()

            latest = RepoResponse(
                name=latest_row.name,
                description=latest_row.description,
                stars=latest_row.stars,
                forks=latest_row.forks,
                language=latest_row.language,
                topics=list(latest_row.topics or []),
            )

            previous: RepoResponse | None = None
            stars_delta = 0
            forks_delta = 0
            if previous_row is not None:
                previous = RepoResponse(
                    name=previous_row.name,
                    description=previous_row.description,
                    stars=previous_row.stars,
                    forks=previous_row.forks,
                    language=previous_row.language,
                    topics=list(previous_row.topics or []),
                )
                stars_delta = latest_row.stars - previous_row.stars
                forks_delta = latest_row.forks - previous_row.forks

            return RepoAnalyticsResponse(
                owner=owner,
                repo=repo,
                latest=latest,
                previous=previous,
                stars_delta=stars_delta,
                forks_delta=forks_delta,
            )
    except RuntimeError:
        return None

    return None

