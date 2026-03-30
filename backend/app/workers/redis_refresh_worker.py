"""
Consume Redis list `gh:refresh_queue` (RPUSH from API when USE_REDIS_REFRESH_QUEUE=1).

Run separately from uvicorn:
  python -m app.workers.redis_refresh_worker

Uses the same REDIS_URL and GitHub token env as the API.
"""

from __future__ import annotations

import asyncio
import json
import logging

from app.config import REDIS_URL
from app.services.github_cache import _async_refresh

log = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)


async def run() -> None:
    if not REDIS_URL:
        raise SystemExit("REDIS_URL is not set")

    import redis.asyncio as redis

    r = redis.from_url(REDIS_URL, decode_responses=True)
    log.info("Redis refresh worker listening on gh:refresh_queue")
    try:
        while True:
            item = await r.blpop("gh:refresh_queue", timeout=5)
            if item is None:
                continue
            _, raw = item
            try:
                msg = json.loads(raw)
                await _async_refresh(
                    msg["path"],
                    msg.get("params"),
                    msg.get("token"),
                    msg["k"],
                )
            except Exception as e:
                log.warning("Refresh job failed: %s", e)
    finally:
        await r.aclose()


if __name__ == "__main__":
    asyncio.run(run())
