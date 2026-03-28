from __future__ import annotations

import json
import logging
import time
from typing import Any

import httpx

from app.celery_app import celery_app
from app.config import CACHE_STALE_MAX_SECONDS, CACHE_TTL_SECONDS, REDIS_URL

log = logging.getLogger(__name__)

_redis_ex = max(CACHE_TTL_SECONDS, CACHE_STALE_MAX_SECONDS)


@celery_app.task(name="github.refresh_cache_entry", ignore_result=True)
def refresh_github_cache_task(cache_key: str, path: str, params_json: str, token: str | None) -> None:
    """Sync refresh of one cached GitHub JSON GET (used when ENABLE_CELERY=1)."""
    if not REDIS_URL:
        return
    try:
        import redis as sync_redis
    except ImportError:
        log.warning("redis package missing; Celery cache refresh skipped.")
        return

    params: dict[str, Any] = json.loads(params_json) if params_json else {}
    headers = {
        "Accept": "application/vnd.github+json",
        "User-Agent": "github-project-visualizer",
        "X-GitHub-Api-Version": "2022-11-28",
    }
    if token:
        headers["Authorization"] = f"Bearer {token}"

    try:
        with httpx.Client(base_url="https://api.github.com", timeout=30.0, headers=headers) as client:
            r = client.get(path, params=params or None)
            r.raise_for_status()
            body = r.json()
    except Exception as e:
        log.debug("Celery GitHub refresh failed for %s: %s", path, e)
        return

    envelope = {"stored_at": int(time.time()), "body": body}
    try:
        rds = sync_redis.from_url(REDIS_URL, decode_responses=True)
        rds.set(
            cache_key,
            json.dumps(envelope, separators=(",", ":"), default=str),
            ex=_redis_ex,
        )
    except Exception as e:
        log.warning("Celery Redis set failed: %s", e)
