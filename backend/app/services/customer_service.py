from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import CustomerProfile


def get_customer_profile(
    db: Session,
    user_id: int,
) -> CustomerProfile | None:
    return db.scalar(
        select(CustomerProfile).where(
            CustomerProfile.user_id == user_id
        )
    )


def create_customer_profile(
    db: Session,
    user_id: int,
    first_name: str | None,
    last_name: str | None,
    phone: str | None,
    profile_image_url: str | None,
) -> CustomerProfile:
    existing_profile = get_customer_profile(
        db=db,
        user_id=user_id,
    )

    if existing_profile is not None:
        raise ValueError("Customer profile already exists")

    profile = CustomerProfile(
        user_id=user_id,
        first_name=first_name,
        last_name=last_name,
        phone=phone,
        profile_image_url=profile_image_url,
    )

    db.add(profile)
    db.flush()

    return profile


def update_customer_profile(
    db: Session,
    profile: CustomerProfile,
    update_data: dict,
) -> CustomerProfile:
    for field, value in update_data.items():
        setattr(profile, field, value)

    db.flush()

    return profile