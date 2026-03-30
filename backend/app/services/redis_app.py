from __future__ import annotations

import logging

import redis.asyncio as redis

from app.config import REDIS_URL

log = logging.getLogger(__name__)

_client: redis.Redis | None = None


async def init_redis() -> None:
    global _client
    if not REDIS_URL:
        log.info("REDIS_URL not set; GitHub response caching disabled.")
        return
    if _client is not None:
        return
    _client = redis.from_url(REDIS_URL, decode_responses=True)
    try:
        await _client.ping()
        log.info("Redis connected for GitHub API cache.")
    except Exception as e:
        log.warning("Redis ping failed; caching disabled: %s", e)
        await _client.aclose()
        _client = None


async def close_redis() -> None:
    global _client
    if _client is not None:
        await _client.aclose()
        _client = None


def redis_client() -> redis.Redis | None:
    return _client
