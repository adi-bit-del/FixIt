from decimal import Decimal

from pydantic import BaseModel, Field


class AddressCreate(BaseModel):
    label: str = Field(
        min_length=1,
        max_length=50,
    )

    address_line_1: str = Field(
        min_length=1,
        max_length=200,
    )

    address_line_2: str | None = Field(
        default=None,
        max_length=200,
    )

    landmark: str | None = Field(
        default=None,
        max_length=150,
    )

    city: str = Field(
        min_length=1,
        max_length=100,
    )

    state: str = Field(
        min_length=1,
        max_length=100,
    )

    postal_code: str = Field(
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

    is_default: bool = False


class AddressUpdate(BaseModel):
    label: str | None = Field(
        default=None,
        min_length=1,
        max_length=50,
    )

    address_line_1: str | None = Field(
        default=None,
        min_length=1,
        max_length=200,
    )

    address_line_2: str | None = Field(
        default=None,
        max_length=200,
    )

    landmark: str | None = Field(
        default=None,
        max_length=150,
    )

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

    is_default: bool | None = None


class AddressResponse(BaseModel):
    id: int
    customer_profile_id: int
    label: str
    address_line_1: str
    address_line_2: str | None
    landmark: str | None
    city: str
    state: str
    postal_code: str
    latitude: Decimal | None
    longitude: Decimal | None
    is_default: bool

    model_config = {
        "from_attributes": True,
    }