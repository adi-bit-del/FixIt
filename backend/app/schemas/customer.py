from datetime import datetime

from pydantic import BaseModel, Field


class CustomerProfileCreate(BaseModel):
    first_name: str | None = Field(
        default=None,
        max_length=100,
    )

    last_name: str | None = Field(
        default=None,
        max_length=100,
    )

    phone: str | None = Field(
        default=None,
        max_length=20,
    )

    profile_image_url: str | None = Field(
        default=None,
        max_length=500,
    )


class CustomerProfileUpdate(BaseModel):
    first_name: str | None = Field(
        default=None,
        max_length=100,
    )

    last_name: str | None = Field(
        default=None,
        max_length=100,
    )

    phone: str | None = Field(
        default=None,
        max_length=20,
    )

    profile_image_url: str | None = Field(
        default=None,
        max_length=500,
    )


class CustomerProfileResponse(BaseModel):
    id: int
    user_id: int
    first_name: str | None
    last_name: str | None
    phone: str | None
    profile_image_url: str | None

    model_config = {
        "from_attributes": True,
    }


class AdminCustomerResponse(BaseModel):
    id: int
    user_id: int

    first_name: str | None
    last_name: str | None
    phone: str | None
    profile_image_url: str | None

    email: str
    is_active: bool
    created_at: datetime

    requests_count: int
    bookings_count: int


class AdminCustomerStatusUpdate(BaseModel):
    is_active: bool