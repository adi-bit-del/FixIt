from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models import (
    Booking,
    CustomerProfile,
    ServiceRequest,
    User,
)


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


def get_admin_customers(
    db: Session,
) -> list[dict]:
    requests_count = (
        select(func.count(ServiceRequest.id))
        .where(
            ServiceRequest.customer_profile_id
            == CustomerProfile.id
        )
        .correlate(CustomerProfile)
        .scalar_subquery()
    )

    bookings_count = (
        select(func.count(Booking.id))
        .where(
            Booking.customer_profile_id
            == CustomerProfile.id
        )
        .correlate(CustomerProfile)
        .scalar_subquery()
    )

    rows = db.execute(
        select(
            CustomerProfile,
            User.email,
            User.is_active,
            User.created_at,
            requests_count.label("requests_count"),
            bookings_count.label("bookings_count"),
        )
        .join(
            User,
            CustomerProfile.user_id == User.id,
        )
        .order_by(
            User.created_at.desc(),
        )
    ).all()

    return [
        {
            "id": customer.id,
            "user_id": customer.user_id,
            "first_name": customer.first_name,
            "last_name": customer.last_name,
            "phone": customer.phone,
            "profile_image_url": customer.profile_image_url,
            "email": email,
            "is_active": is_active,
            "created_at": created_at,
            "requests_count": requests_count_value,
            "bookings_count": bookings_count_value,
        }
        for (
            customer,
            email,
            is_active,
            created_at,
            requests_count_value,
            bookings_count_value,
        ) in rows
    ]