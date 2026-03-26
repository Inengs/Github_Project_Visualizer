from fastapi import FastAPI

from app.db import init_db
from app.routes.analytics import router as analytics_router
from app.routes.repo import router as repo_router

app = FastAPI()
app.include_router(repo_router, prefix="/api")
app.include_router(analytics_router, prefix="/api")


@app.on_event("startup")
async def _startup() -> None:
    await init_db()


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
