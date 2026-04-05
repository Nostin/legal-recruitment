from fastapi import FastAPI

from app.routes.health import router as health_router

app = FastAPI(title="OpenCourt API", version="0.1.0")
app.include_router(health_router, prefix="/api", tags=["health"])


@app.get("/")
def root() -> dict[str, str]:
    return {"service": "opencourt-api", "docs": "/docs"}
