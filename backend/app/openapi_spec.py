"""
Lead contract: `backend/openapi.yaml` is the source of truth for paths the frontend uses.

`/openapi.json` and Swagger UI load that file verbatim so the documented API matches
the agreed contract. Implement new routes in FastAPI first, then ask the lead to add
them to `openapi.yaml` before frontend adoption.
"""

from __future__ import annotations

from pathlib import Path
from typing import Any

import yaml
from fastapi import FastAPI


def attach_lead_openapi(app: FastAPI) -> None:
    """Serve the lead's OpenAPI document from `openapi.yaml` (no merge with auto-discovery)."""

    def _load() -> dict[str, Any]:
        path = Path(__file__).resolve().parent.parent / "openapi.yaml"
        with path.open(encoding="utf-8") as f:
            return yaml.safe_load(f)

    def openapi_fn() -> dict[str, Any]:
        existing = getattr(app, "openapi_schema", None)
        if existing is None:
            app.openapi_schema = _load()
        return app.openapi_schema

    app.openapi = openapi_fn  # type: ignore[method-assign]
