from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Booking, Review


def get_customer_reviews(
    db: Session,
    customer_profile_id: int,
) -> list[Review]:
    return list(
        db.scalars(
            select(Review)
            .where(
                Review.customer_profile_id == customer_profile_id,
                Review.moderation_status == "VISIBLE",
            )
            .order_by(Review.created_at.desc())
        ).all()
    )


def get_professional_reviews(
    db: Session,
    professional_profile_id: int,
) -> list[Review]:
    return list(
        db.scalars(
            select(Review)
            .where(
                Review.professional_profile_id
                == professional_profile_id,
                Review.moderation_status == "VISIBLE",
            )
            .order_by(Review.created_at.desc())
        ).all()
    )


def create_review(
    db: Session,
    booking: Booking,
    customer_profile_id: int,
    rating: int,
    comment: str | None,
) -> Review:
    if booking.customer_profile_id != customer_profile_id:
        raise ValueError(
            "Booking does not belong to this customer"
        )

    if booking.status != "COMPLETED":
        raise ValueError(
            "Only completed bookings can be reviewed"
        )

    existing_review = db.scalar(
        select(Review).where(
            Review.booking_id == booking.id
        )
    )

    if existing_review is not None:
        raise ValueError(
            "A review already exists for this booking"
        )

    review = Review(
        booking_id=booking.id,
        customer_profile_id=booking.customer_profile_id,
        professional_profile_id=booking.professional_profile_id,
        rating=rating,
        comment=comment,
        moderation_status="VISIBLE",
    )

    db.add(review)
    db.flush()

    return review