import os

# GitHub personal access token — used to authenticate requests to the GitHub API.
# Without this, GitHub rate-limits you to 60 requests/hour.
# Set this in your .env file as GITHUB_TOKEN=your_token_here
GITHUB_TOKEN: str | None = os.getenv("GITHUB_TOKEN")

# Comma-separated list of allowed origins for CORS (e.g. "http://localhost:3000").
# Not wired up yet — intended for when a frontend is added.
ALLOWED_ORIGINS: str | None = os.getenv("ALLOWED_ORIGINS")

# Database connection string.
# Supports PostgreSQL (asyncpg) e.g. "postgresql+asyncpg://user:pass@localhost/dbname"
# or SQLite (aiosqlite) e.g. "sqlite+aiosqlite:///./db.sqlite3" for local development.
# If not set, the app runs without a database (snapshots won't be saved).
DATABASE_URL: str | None = os.getenv("DATABASE_URL")
