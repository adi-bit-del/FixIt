from decimal import Decimal

from pydantic import BaseModel, Field


class ProfessionalServiceCreate(BaseModel):
    service_id: int = Field(gt=0)

    custom_price: Decimal | None = Field(
        default=None,
        gt=0,
        max_digits=10,
        decimal_places=2,
    )


class ProfessionalServiceUpdate(BaseModel):
    custom_price: Decimal | None = Field(
        default=None,
        gt=0,
        max_digits=10,
        decimal_places=2,
    )

    is_active: bool | None = None


class ProfessionalServiceResponse(BaseModel):
    id: int
    professional_profile_id: int
    service_id: int
    custom_price: Decimal | None
    is_active: bool

    model_config = {
        "from_attributes": True,
    }