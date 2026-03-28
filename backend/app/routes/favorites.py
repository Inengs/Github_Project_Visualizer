from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy import delete, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import FavoriteRepo, User, get_session_required
from app.deps.github_client import get_current_user
from app.schemas.favorites import FavoriteCreate, FavoriteItem

router = APIRouter(prefix="/me/favorites", tags=["favorites"])


@router.get("", response_model=list[FavoriteItem])
async def list_favorites(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session_required),
) -> list[FavoriteItem]:
    result = await db.execute(
        select(FavoriteRepo.owner, FavoriteRepo.repo).where(FavoriteRepo.user_id == user.id)
    )
    rows = result.all()
    return [FavoriteItem(owner=r[0], repo=r[1]) for r in rows]


@router.post("", response_model=FavoriteItem, status_code=201)
async def add_favorite(
    body: FavoriteCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session_required),
) -> FavoriteItem:
    row = FavoriteRepo(user_id=user.id, owner=body.owner, repo=body.repo)
    db.add(row)
    try:
        await db.commit()
    except IntegrityError:
        await db.rollback()
        raise HTTPException(status_code=409, detail="Repository already in favorites.") from None
    return FavoriteItem(owner=body.owner, repo=body.repo)


@router.delete("/{owner}/{repo}", status_code=204, response_model=None)
async def remove_favorite(
    owner: str,
    repo: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session_required),
) -> Response:
    await db.execute(
        delete(FavoriteRepo).where(
            FavoriteRepo.user_id == user.id,
            FavoriteRepo.owner == owner,
            FavoriteRepo.repo == repo,
        )
    )
    await db.commit()
    return Response(status_code=204)
