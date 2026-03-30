import os

# GitHub personal access token — used when no user OAuth token is present.
# Without any token, GitHub rate-limits you to 60 requests/hour.
GITHUB_TOKEN: str | None = os.getenv("GITHUB_TOKEN")

# GitHub OAuth App (https://github.com/settings/developers) — enables login and private repo access.
GITHUB_CLIENT_ID: str | None = os.getenv("GITHUB_CLIENT_ID")
GITHUB_CLIENT_SECRET: str | None = os.getenv("GITHUB_CLIENT_SECRET")
# Must match the Authorization callback URL in the GitHub OAuth app settings, e.g.
# http://localhost:8000/api/auth/github/callback
GITHUB_OAUTH_CALLBACK_URL: str | None = os.getenv("GITHUB_OAUTH_CALLBACK_URL")
# After OAuth, browser is redirected here with ?token=<app_jwt> (set for SPA).
FRONTEND_URL: str | None = os.getenv("FRONTEND_URL")

# Comma-separated list of allowed origins for CORS.
ALLOWED_ORIGINS: str | None = os.getenv("ALLOWED_ORIGINS")

# Database connection string (required for OAuth users and favorites).
DATABASE_URL: str | None = os.getenv("DATABASE_URL")

# HS256 JWT for API sessions after GitHub OAuth.
JWT_SECRET: str | None = os.getenv("JWT_SECRET")
JWT_ALGORITHM: str = "HS256"
JWT_EXPIRE_SECONDS: int = int(os.getenv("JWT_EXPIRE_SECONDS", "604800"))

# --- Redis cache (GitHub API) — set REDIS_URL to enable ---
REDIS_URL: str | None = os.getenv("REDIS_URL")
# Fresh window per cache entry (seconds). Clamped to 300–900 (5–15 minutes).
CACHE_TTL_SECONDS: int = max(300, min(900, int(os.getenv("CACHE_TTL_SECONDS", "600"))))
# Max age (seconds) we may still return a cached body when GitHub rate-limits us.
CACHE_STALE_MAX_SECONDS: int = int(os.getenv("CACHE_STALE_MAX_SECONDS", "86400"))
# Optional Celery worker for cache refresh (broker usually same as Redis).
ENABLE_CELERY: bool = os.getenv("ENABLE_CELERY", "").lower() in ("1", "true", "yes")
CELERY_BROKER_URL: str | None = os.getenv("CELERY_BROKER_URL") or REDIS_URL
CELERY_RESULT_BACKEND: str | None = os.getenv("CELERY_RESULT_BACKEND") or REDIS_URL
# Simple Redis list queue (RPUSH/BLPOP) when Celery is off; worker: python -m app.workers.redis_refresh_worker
USE_REDIS_REFRESH_QUEUE: bool = os.getenv("USE_REDIS_REFRESH_QUEUE", "").lower() in ("1", "true", "yes")

# Optional OpenAI key for README AI sections (user may override per request).
OPENAI_API_KEY: str | None = os.getenv("OPENAI_API_KEY")
