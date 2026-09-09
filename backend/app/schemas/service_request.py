from datetime import datetime

from pydantic import BaseModel


class ServiceRequestCreate(BaseModel):
    professional_profile_id: int
    service_id: int
    address_id: int
    description: str | None = None
    preferred_date: datetime | None = None


class ServiceRequestResponse(BaseModel):
    id: int
    customer_profile_id: int
    professional_profile_id: int
    service_id: int
    address_id: int
    description: str | None
    preferred_date: datetime | None
    status: str
    created_at: datetime
    updated_at: datetime


class AdminServiceRequestResponse(BaseModel):
    id: int

    customer_profile_id: int
    customer_name: str

    professional_profile_id: int
    professional_name: str

    service_id: int
    service_name: str

    address_id: int

    description: str | None
    preferred_date: datetime | None
    status: str

    created_at: datetime
    updated_at: datetime