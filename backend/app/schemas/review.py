from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


class ReviewCreate(BaseModel):
    rating: int = Field(
        ge=1,
        le=5,
    )

    comment: str | None = Field(
        default=None,
        max_length=2000,
    )


class ReviewResponse(BaseModel):
    id: int
    booking_id: int
    customer_profile_id: int
    professional_profile_id: int
    rating: int
    comment: str | None
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True,
    }


class AdminReviewResponse(BaseModel):
    id: int
    booking_id: int

    customer_profile_id: int
    customer_name: str

    professional_profile_id: int
    professional_name: str

    service_id: int
    service_name: str

    rating: int
    comment: str | None

    moderation_status: Literal["VISIBLE", "HIDDEN"]

    created_at: datetime
    updated_at: datetime


class AdminReviewModerationUpdate(BaseModel):
    moderation_status: Literal["VISIBLE", "HIDDEN"]