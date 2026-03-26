from __future__ import annotations

from sqlalchemy.exc import SQLAlchemyError

from app.db import RepositorySnapshot, get_session
from app.schemas.repo import RepoResponse


async def save_repo_snapshot(owner: str, repo: str, data: RepoResponse) -> None:
    """
    Best-effort persistence of the latest repo snapshot.

    If the DB is not configured, this is a no-op.
    """
    try:
        async for session in get_session():
            snapshot = RepositorySnapshot(
                owner=owner,
                repo=repo,
                name=data.name,
                description=data.description,
                stars=data.stars,
                forks=data.forks,
                language=data.language,
                topics=data.topics,
            )
            session.add(snapshot)
            await session.commit()
            break
    except RuntimeError:
        # DB not configured.
        return
    except SQLAlchemyError as e:
        raise RuntimeError(f"Failed to save repo snapshot: {e}") from e

