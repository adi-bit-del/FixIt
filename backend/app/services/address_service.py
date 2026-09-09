from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Address


def get_address(
    db: Session,
    address_id: int,
    customer_profile_id: int,
) -> Address | None:
    return db.scalar(
        select(Address).where(
            Address.id == address_id,
            Address.customer_profile_id == customer_profile_id,
        )
    )


def get_customer_addresses(
    db: Session,
    customer_profile_id: int,
) -> list[Address]:
    return list(
        db.scalars(
            select(Address)
            .where(Address.customer_profile_id == customer_profile_id)
            .order_by(Address.is_default.desc(), Address.created_at.desc())
        ).all()
    )


def create_address(
    db: Session,
    customer_profile_id: int,
    label: str,
    address_line_1: str,
    address_line_2: str | None,
    landmark: str | None,
    city: str,
    state: str,
    postal_code: str,
    latitude,
    longitude,
    is_default: bool,
) -> Address:

    if is_default:
        existing_default = db.scalar(
            select(Address).where(
                Address.customer_profile_id == customer_profile_id,
                Address.is_default.is_(True),
            )
        )

        if existing_default is not None:
            existing_default.is_default = False

    address = Address(
        customer_profile_id=customer_profile_id,
        label=label,
        address_line_1=address_line_1,
        address_line_2=address_line_2,
        landmark=landmark,
        city=city,
        state=state,
        postal_code=postal_code,
        latitude=latitude,
        longitude=longitude,
        is_default=is_default,
    )

    db.add(address)
    db.flush()

    return address


def update_address(
    db: Session,
    address: Address,
    update_data: dict,
) -> Address:

    if update_data.get("is_default") is True:
        existing_default = db.scalar(
            select(Address).where(
                Address.customer_profile_id == address.customer_profile_id,
                Address.is_default.is_(True),
                Address.id != address.id,
            )
        )

        if existing_default is not None:
            existing_default.is_default = False

    for field, value in update_data.items():
        setattr(address, field, value)

    db.flush()

    return address


def delete_address(
    db: Session,
    address: Address,
) -> None:
    db.delete(address)
    db.flush()