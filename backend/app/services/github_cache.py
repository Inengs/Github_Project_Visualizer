from __future__ import annotations

import asyncio
import hashlib
import json
import logging
import time
from typing import Any, Literal

from starlette.responses import Response

from app.config import (
    CACHE_STALE_MAX_SECONDS,
    CACHE_TTL_SECONDS,
    ENABLE_CELERY,
    USE_REDIS_REFRESH_QUEUE,
)
from app.services.github import GitHubApiError, GitHubClient
from app.services.redis_app import redis_client

log = logging.getLogger(__name__)

CacheHeader = Literal["MISS", "HIT", "STALE", "REVALIDATING"]

_FRESH_TTL = CACHE_TTL_SECONDS
_STALE_CEILING = max(_FRESH_TTL, CACHE_STALE_MAX_SECONDS)
_SOFT_REVALIDATE_AFTER = int(_FRESH_TTL * 0.8)


def _token_fingerprint(token: str | None) -> str:
    raw = token if token else ""
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()[:16]


def cache_key(path: str, params: dict[str, Any] | None, token_fp: str) -> str:
    q = json.dumps(params or {}, sort_keys=True, separators=(",", ":"))
    h = hashlib.sha256(f"{path}|{q}".encode()).hexdigest()[:24]
    return f"gh:v1:{token_fp}:{h}"


def _is_rate_limit_error(exc: GitHubApiError) -> bool:
    if exc.status_code == 429:
        return True
    if exc.status_code == 403:
        m = (exc.message or "").lower()
        return "rate limit" in m or "api rate limit exceeded" in m or "secondary rate limit" in m
    return False


def _set_cache_headers(response: Response | None, status: CacheHeader) -> None:
    if response is not None:
        response.headers["X-Cache"] = status


async def _redis_get(key: str) -> dict[str, Any] | None:
    r = redis_client()
    if r is None:
        return None
    try:
        raw = await r.get(key)
        if not raw:
            return None
        data = json.loads(raw)
        return data if isinstance(data, dict) else None
    except Exception as e:
        log.warning("Redis get failed for %s: %s", key, e)
        return None


async def _redis_set(key: str, body: Any) -> None:
    r = redis_client()
    if r is None:
        return
    envelope = {"stored_at": int(time.time()), "body": body}
    try:
        await r.set(key, json.dumps(envelope, separators=(",", ":"), default=str), ex=_STALE_CEILING)
    except Exception as e:
        log.warning("Redis set failed for %s: %s", key, e)


async def _fetch_origin(gh: GitHubClient, path: str, params: dict[str, Any] | None) -> Any:
    return await gh.request_json("GET", path, params=params)


def _schedule_background_refresh(
    *,
    path: str,
    params: dict[str, Any] | None,
    token: str | None,
    cache_key_str: str,
) -> None:
    if ENABLE_CELERY:
        try:
            from app.tasks.github_cache import refresh_github_cache_task

            refresh_github_cache_task.delay(
                cache_key_str,
                path,
                json.dumps(params or {}, sort_keys=True),
                token,
            )
        except ImportError:
            asyncio.create_task(_async_refresh(path, params, token, cache_key_str))
        except Exception as e:
            log.debug("Celery refresh not scheduled (%s); using asyncio.", e)
            asyncio.create_task(_async_refresh(path, params, token, cache_key_str))
    elif USE_REDIS_REFRESH_QUEUE:
        asyncio.create_task(_push_redis_queue(cache_key_str, path, params, token))
    else:
        asyncio.create_task(_async_refresh(path, params, token, cache_key_str))


async def _push_redis_queue(
    cache_key_str: str,
    path: str,
    params: dict[str, Any] | None,
    token: str | None,
) -> None:
    r = redis_client()
    if r is None:
        return
    payload = json.dumps(
        {"k": cache_key_str, "path": path, "params": params or {}, "token": token},
        separators=(",", ":"),
    )
    try:
        await r.rpush("gh:refresh_queue", payload)
    except Exception as e:
        log.warning("Redis queue push failed: %s", e)


async def _async_refresh(
    path: str,
    params: dict[str, Any] | None,
    token: str | None,
    cache_key_str: str,
) -> None:
    try:
        async with GitHubClient(token=token) as gh:
            body = await _fetch_origin(gh, path, params)
        await _redis_set(cache_key_str, body)
    except Exception as e:
        log.debug("Background GitHub refresh failed for %s: %s", path, e)


async def _async_refresh_commit_activity(
    owner: str,
    repo: str,
    token: str | None,
    cache_key_str: str,
) -> None:
    path = f"/repos/{owner}/{repo}/stats/commit_activity"
    try:
        async with GitHubClient(token=token) as gh:
            r = await gh.get_response(path)
            if r.status_code != 200:
                return
            body = r.json()
        await _redis_set(cache_key_str, body)
    except Exception as e:
        log.debug("Background activity refresh failed for %s/%s: %s", owner, repo, e)


async def get_json_cached(
    *,
    gh: GitHubClient,
    path: str,
    params: dict[str, Any] | None,
    token: str | None,
    response: Response | None,
) -> Any:
    """
    Redis-backed cache for GitHub JSON GETs.

    - Fresh window: CACHE_TTL_SECONDS (5–15 min).
    - After ~80% of fresh TTL: return cached row and refresh in background.
    - Past fresh but before CACHE_STALE_MAX_SECONDS: revalidate inline; on rate limit, return stale.
    """
    token_fp = _token_fingerprint(token)
    key = cache_key(path, params, token_fp)
    now = int(time.time())
    cached = await _redis_get(key)

    if cached and isinstance(cached.get("stored_at"), int) and "body" in cached:
        age = now - int(cached["stored_at"])
        body = cached["body"]

        if age < _FRESH_TTL:
            if age >= _SOFT_REVALIDATE_AFTER:
                _schedule_background_refresh(path=path, params=params, token=token, cache_key_str=key)
                _set_cache_headers(response, "REVALIDATING")
            else:
                _set_cache_headers(response, "HIT")
            return body

        if age < _STALE_CEILING:
            try:
                fresh = await _fetch_origin(gh, path, params)
                await _redis_set(key, fresh)
                _set_cache_headers(response, "MISS")
                return fresh
            except GitHubApiError as e:
                if _is_rate_limit_error(e):
                    log.info("GitHub rate limit for %s; serving stale cache (age=%ss).", path, age)
                    _set_cache_headers(response, "STALE")
                    if response is not None:
                        response.headers["X-RateLimit-Fallback"] = "true"
                    return body
                raise
            except Exception:
                _set_cache_headers(response, "STALE")
                return body

    try:
        fresh = await _fetch_origin(gh, path, params)
        await _redis_set(key, fresh)
        _set_cache_headers(response, "MISS")
        return fresh
    except GitHubApiError as e:
        if _is_rate_limit_error(e) and cached and "body" in cached:
            _set_cache_headers(response, "STALE")
            if response is not None:
                response.headers["X-RateLimit-Fallback"] = "true"
            return cached["body"]
        raise


async def get_commit_activity_cached(
    *,
    gh: GitHubClient,
    owner: str,
    repo: str,
    token: str | None,
    response: Response | None,
) -> Any:
    """
    Same TTL/stale strategy as get_json_cached, but uses raw GET (handles 202 from GitHub stats).
    """
    path = f"/repos/{owner}/{repo}/stats/commit_activity"
    token_fp = _token_fingerprint(token)
    key = cache_key(path, None, token_fp)
    now = int(time.time())
    cached = await _redis_get(key)

    async def _live_fetch() -> Any:
        r = await gh.get_response(path)
        if r.status_code == 202:
            raise GitHubApiError(
                status_code=503,
                message="GitHub is still building commit activity statistics; try again shortly.",
            )
        if r.status_code >= 400:
            raise GitHubApiError(status_code=r.status_code, message=r.text[:500])
        try:
            return r.json()
        except Exception as exc:
            raise GitHubApiError(status_code=502, message="Invalid JSON from GitHub statistics") from exc

    if cached and isinstance(cached.get("stored_at"), int) and "body" in cached:
        age = now - int(cached["stored_at"])
        body = cached["body"]
        if age < _FRESH_TTL:
            if age >= _SOFT_REVALIDATE_AFTER:
                # Stats endpoint needs raw GET, not JSON helper (Celery task uses JSON only).
                asyncio.create_task(_async_refresh_commit_activity(owner, repo, token, key))
                _set_cache_headers(response, "REVALIDATING")
            else:
                _set_cache_headers(response, "HIT")
            return body
        if age < _STALE_CEILING:
            try:
                fresh = await _live_fetch()
                await _redis_set(key, fresh)
                _set_cache_headers(response, "MISS")
                return fresh
            except GitHubApiError as e:
                if _is_rate_limit_error(e) or e.status_code == 503:
                    _set_cache_headers(response, "STALE")
                    if _is_rate_limit_error(e) and response is not None:
                        response.headers["X-RateLimit-Fallback"] = "true"
                    return body
                raise

    try:
        fresh = await _live_fetch()
        await _redis_set(key, fresh)
        _set_cache_headers(response, "MISS")
        return fresh
    except GitHubApiError as e:
        if (_is_rate_limit_error(e) or e.status_code == 503) and cached and "body" in cached:
            _set_cache_headers(response, "STALE")
            if response is not None and _is_rate_limit_error(e):
                response.headers["X-RateLimit-Fallback"] = "true"
            return cached["body"]
        raise
