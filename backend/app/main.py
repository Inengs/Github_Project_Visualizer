from fastapi import FastAPI

from app.db import init_db
from app.routes.analytics import router as analytics_router
from app.routes.repo import router as repo_router
from fastapi.middleware.cors import CORSMiddleware
from app.config import ALLOWED_ORIGINS

app = FastAPI()

# Register route groups under the /api prefix.
app.include_router(repo_router, prefix="/api")
app.include_router(analytics_router, prefix="/api")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS.split(",") if ALLOWED_ORIGINS else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def _startup() -> None:
    """
    Runs once when the server starts.
    Creates database tables if they don't already exist.
    Safe to call repeatedly — SQLAlchemy only creates missing tables.
    """
    await init_db()


@app.get("/health")
def health() -> dict[str, str]:
    """
    Simple health check endpoint.
    Returns 200 OK with {"status": "ok"} if the server is running.
    Useful for load balancers, Docker health checks, or uptime monitors.
    """
    return {"status": "ok"}
