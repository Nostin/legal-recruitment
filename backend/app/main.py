from fastapi import FastAPI

from app.routes.candidates import router as candidates_router
from app.routes.health import router as health_router

app = FastAPI(title="OpenCourt API", version="0.1.0")
app.include_router(health_router, prefix="/api", tags=["health"])
app.include_router(candidates_router, prefix="/candidates", tags=["candidates"])


@app.get("/")
def root() -> dict[str, str]:
    return {"service": "opencourt-api", "docs": "/docs"}
