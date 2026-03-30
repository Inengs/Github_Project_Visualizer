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
