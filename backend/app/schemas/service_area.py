from decimal import Decimal

from pydantic import BaseModel, Field


class ServiceAreaCreate(BaseModel):
    city: str = Field(
        min_length=1,
        max_length=100,
    )

    state: str = Field(
        min_length=1,
        max_length=100,
    )

    postal_code: str | None = Field(
        default=None,
        pattern=r"^\d{6}$",
    )

    latitude: Decimal | None = Field(
        default=None,
        ge=Decimal("-90"),
        le=Decimal("90"),
    )

    longitude: Decimal | None = Field(
        default=None,
        ge=Decimal("-180"),
        le=Decimal("180"),
    )

    radius_km: Decimal = Field(
        default=Decimal("5.00"),
        gt=0,
        max_digits=6,
        decimal_places=2,
    )


class ServiceAreaUpdate(BaseModel):
    city: str | None = Field(
        default=None,
        min_length=1,
        max_length=100,
    )

    state: str | None = Field(
        default=None,
        min_length=1,
        max_length=100,
    )

    postal_code: str | None = Field(
        default=None,
        pattern=r"^\d{6}$",
    )

    latitude: Decimal | None = Field(
        default=None,
        ge=Decimal("-90"),
        le=Decimal("90"),
    )

    longitude: Decimal | None = Field(
        default=None,
        ge=Decimal("-180"),
        le=Decimal("180"),
    )

    radius_km: Decimal | None = Field(
        default=None,
        gt=0,
        max_digits=6,
        decimal_places=2,
    )

    is_active: bool | None = None


class ServiceAreaResponse(BaseModel):
    id: int
    professional_profile_id: int
    city: str
    state: str
    postal_code: str | None
    latitude: Decimal | None
    longitude: Decimal | None
    radius_km: Decimal
    is_active: bool

    model_config = {
        "from_attributes": True,
    }