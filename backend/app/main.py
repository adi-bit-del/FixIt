from fastapi import FastAPI

from app.api.v1.auth import router as auth_router

from app.api.v1.customer import router as customer_router


app = FastAPI(
    title="FixIt API",
    description="Backend API for the FixIt service marketplace.",
    version="0.1.0",
)


app.include_router(
    auth_router,
    prefix="/api/v1",
)


@app.get("/")
async def root():
    return {
        "message": "Welcome to FixIt API",
        "status": "running",
    }


app.include_router(
    customer_router,
    prefix="/api/v1",
)