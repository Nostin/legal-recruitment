from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.candidates import router as candidates_router
from app.routes.firms import router as firms_router
from app.routes.health import router as health_router
from app.routes.introduction_requests import router as introduction_requests_router
from app.routes.users import router as users_router

app = FastAPI(title="OpenCourt API", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(health_router, prefix="/api", tags=["health"])
app.include_router(candidates_router, prefix="/candidates", tags=["candidates"])
app.include_router(firms_router, prefix="/firms", tags=["firms"])
app.include_router(users_router, prefix="/users", tags=["users"])
app.include_router(
    introduction_requests_router,
    prefix="/introduction-requests",
    tags=["introduction-requests"],
)


@app.get("/")
def root() -> dict[str, str]:
    return {"service": "opencourt-api", "docs": "/docs"}
