"""
Optional Celery app for background GitHub cache refresh.

Run worker (same env as API):
  celery -A app.celery_app.celery_app worker -l info

Requires ENABLE_CELERY=1 and REDIS_URL / CELERY_BROKER_URL.
"""

from __future__ import annotations

from celery import Celery

from app.config import CELERY_BROKER_URL, CELERY_RESULT_BACKEND

_broker = CELERY_BROKER_URL or "redis://localhost:6379/0"
_backend = CELERY_RESULT_BACKEND or _broker

celery_app = Celery(
    "github_project_visualizer",
    broker=_broker,
    backend=_backend,
)

celery_app.conf.task_default_queue = "github_cache"
# Register tasks when Celery is installed (worker imports this module).
import app.tasks.github_cache  # noqa: F401, E402
