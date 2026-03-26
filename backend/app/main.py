from fastapi import FastAPI

from app.routes.repo import router as repo_router

app = FastAPI()
app.include_router(repo_router, prefix="/api")


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
