from decimal import Decimal

from pydantic import BaseModel, Field


class ServiceCreate(BaseModel):
    category_id: int = Field(gt=0)

    name: str = Field(
        min_length=1,
        max_length=150,
    )

    description: str | None = Field(
        default=None,
        max_length=500,
    )

    base_price: Decimal = Field(
        gt=0,
        max_digits=10,
        decimal_places=2,
    )


class ServiceUpdate(BaseModel):
    category_id: int | None = Field(
        default=None,
        gt=0,
    )

    name: str | None = Field(
        default=None,
        min_length=1,
        max_length=150,
    )

    description: str | None = Field(
        default=None,
        max_length=500,
    )

    base_price: Decimal | None = Field(
        default=None,
        gt=0,
        max_digits=10,
        decimal_places=2,
    )

    is_active: bool | None = None


class ServiceResponse(BaseModel):
    id: int
    category_id: int
    name: str
    description: str | None
    base_price: Decimal
    is_active: bool

    model_config = {
        "from_attributes": True,
    }