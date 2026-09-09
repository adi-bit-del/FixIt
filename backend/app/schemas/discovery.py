from decimal import Decimal

from pydantic import BaseModel


class ProfessionalDiscoveryResponse(BaseModel):
    id: int
    business_name: str
    bio: str | None
    experience_years: int
    phone: str | None
    profile_image_url: str | None
    verification_status: str
    service_id: int
    service_name: str
    price: Decimal

    model_config = {
        "from_attributes": True,
    }