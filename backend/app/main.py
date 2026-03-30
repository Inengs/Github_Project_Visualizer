from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import ALLOWED_ORIGINS
from app.db import init_db
from app.openapi_spec import attach_lead_openapi
from app.routes.rate_limit import router as rate_limit_router
from app.routes.repo import router as repo_router
from app.routes.analytics import router as analytics_router
from app.routes.auth import router as auth_router
from app.routes.favorites import router as favorites_router
from app.services.redis_app import close_redis, init_redis


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_redis()
    await init_db()
    yield
    await close_redis()


# Contract: paths under /api must match `backend/openapi.yaml` (served as /openapi.json).

app = FastAPI(
    title="GitHub Project Visualizer API",
    version="1.0.0",
    description="API contract is defined in `backend/openapi.yaml` (served at /openapi.json).",
    lifespan=lifespan,
)

attach_lead_openapi(app)

app.include_router(repo_router, prefix="/api")
app.include_router(rate_limit_router, prefix="/api")
app.include_router(analytics_router, prefix="/api")
app.include_router(auth_router, prefix="/api")
app.include_router(favorites_router, prefix="/api")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in ALLOWED_ORIGINS.split(",") if o.strip()] if ALLOWED_ORIGINS else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict[str, str]:
    """Operations endpoint; intentionally not part of `openapi.yaml`."""
    return {"status": "ok"}
