from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings

from app.api.v1.auth import router as auth_router
from app.api.v1.customer import router as customer_router
from app.api.v1.address import router as address_router
from app.api.v1.catalog import admin_router as catalog_admin_router
from app.api.v1.catalog import router as catalog_router
from app.api.v1.professional import router as professional_router
from app.api.v1.service_area import router as service_area_router
from app.api.v1.admin import router as admin_router
from app.api.v1.discovery import router as discovery_router
from app.api.v1.service_request import (
    customer_router as customer_request_router,
    professional_router as professional_request_router,
)
from app.api.v1.quote import (
    customer_router as customer_quote_router,
    professional_router as professional_quote_router,
)
from app.api.v1.booking import (
    customer_router as customer_booking_router,
    professional_router as professional_booking_router,
)
from app.api.v1.payment import router as payment_router
from app.api.v1.review import (
    customer_router as customer_review_router,
    professional_router as professional_review_router,
)
from app.api.v1.notification import router as notification_router


app = FastAPI(
    title="FixIt API",
    description="Backend API for the FixIt service marketplace.",
    version="0.1.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        origin.strip()
        for origin in settings.cors_origins.split(",")
        if origin.strip()
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {
        "message": "Welcome to FixIt API",
        "status": "running",
    }


@app.get("/health")
async def health():
    return {
        "status": "ok",
    }


app.include_router(
    auth_router,
    prefix="/api/v1",
)

app.include_router(
    customer_router,
    prefix="/api/v1",
)

app.include_router(
    address_router,
    prefix="/api/v1",
)

app.include_router(
    catalog_router,
    prefix="/api/v1",
)

app.include_router(
    catalog_admin_router,
    prefix="/api/v1",
)

app.include_router(
    professional_router,
    prefix="/api/v1",
)

app.include_router(
    service_area_router,
    prefix="/api/v1",
)

app.include_router(
    admin_router,
    prefix="/api/v1",
)

app.include_router(
    discovery_router,
    prefix="/api/v1",
)

app.include_router(
    customer_request_router,
    prefix="/api/v1",
)

app.include_router(
    professional_request_router,
    prefix="/api/v1",
)

app.include_router(
    customer_quote_router,
    prefix="/api/v1",
)

app.include_router(
    professional_quote_router,
    prefix="/api/v1",
)

app.include_router(
    customer_booking_router,
    prefix="/api/v1",
)

app.include_router(
    professional_booking_router,
    prefix="/api/v1",
)

app.include_router(
    payment_router,
    prefix="/api/v1",
)

app.include_router(
    customer_review_router,
    prefix="/api/v1",
)

app.include_router(
    professional_review_router,
    prefix="/api/v1",
)

app.include_router(
    notification_router,
    prefix="/api/v1",
)