from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, Field


class QuoteCreate(BaseModel):
    professional_service_id: int = Field(gt=0)

    amount: Decimal = Field(
        gt=0,
        max_digits=10,
        decimal_places=2,
    )

    note: str | None = None

    expires_at: datetime | None = None


class QuoteResponse(BaseModel):
    id: int
    service_request_id: int
    professional_service_id: int
    amount: Decimal
    note: str | None
    status: str
    expires_at: datetime | None
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True,
    }


class AdminQuoteResponse(BaseModel):
    id: int
    service_request_id: int
    professional_service_id: int

    customer_profile_id: int
    customer_name: str

    professional_profile_id: int
    professional_name: str

    service_id: int
    service_name: str

    amount: Decimal
    note: str | None
    status: str
    expires_at: datetime | None
    created_at: datetime
    updated_at: datetime