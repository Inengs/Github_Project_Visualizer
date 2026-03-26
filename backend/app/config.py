import os

GITHUB_TOKEN: str | None = os.getenv("GITHUB_TOKEN")
ALLOWED_ORIGINS: str | None = os.getenv("ALLOWED_ORIGINS")
DATABASE_URL: str | None = os.getenv("DATABASE_URL")
