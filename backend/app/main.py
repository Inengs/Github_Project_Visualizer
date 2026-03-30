from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import ALLOWED_ORIGINS
from app.db import init_db
from app.openapi_spec import attach_lead_openapi
from app.routes.rate_limit import router as rate_limit_router
from app.routes.repo import router as repo_router

# Contract: paths under /api must match `backend/openapi.yaml` (served as /openapi.json).
# Optional modules (analytics, GitHub OAuth, favorites) exist under `app/routes/` but are
# not mounted here so the live documented API stays aligned with the lead spec.
# To expose them later, include their routers and get the openapi.yaml updated first.

app = FastAPI(
    title="GitHub Project Visualizer API",
    version="1.0.0",
    description="API contract is defined in `backend/openapi.yaml` (served at /openapi.json).",
)

attach_lead_openapi(app)

app.include_router(repo_router, prefix="/api")
app.include_router(rate_limit_router, prefix="/api")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in ALLOWED_ORIGINS.split(",") if o.strip()] if ALLOWED_ORIGINS else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def _startup() -> None:
    await init_db()


@app.get("/health")
def health() -> dict[str, str]:
    """Operations endpoint; intentionally not part of `openapi.yaml`."""
    return {"status": "ok"}
