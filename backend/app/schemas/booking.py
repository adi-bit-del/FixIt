from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel


class BookingCreate(BaseModel):
    scheduled_at: datetime


class BookingResponse(BaseModel):
    id: int
    service_request_id: int
    quote_id: int
    customer_profile_id: int
    professional_profile_id: int
    service_id: int
    address_id: int
    amount: Decimal
    scheduled_at: datetime
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True,
    }


class AdminBookingResponse(BaseModel):
    id: int
    service_request_id: int
    quote_id: int

    customer_profile_id: int
    customer_name: str

    professional_profile_id: int
    professional_name: str

    service_id: int
    service_name: str

    address_id: int
    amount: Decimal
    scheduled_at: datetime
    status: str
    created_at: datetime
    updated_at: datetime