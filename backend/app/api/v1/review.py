from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import require_role
from app.models import ProfessionalProfile, User
from app.schemas.review import ReviewCreate, ReviewResponse
from app.services.booking import get_customer_booking
from app.services.customer_service import get_customer_profile
from app.services.notification import create_notification
from app.services.review import (
    create_review,
    get_customer_reviews,
    get_professional_reviews,
)


customer_router = APIRouter(
    prefix="/customer/reviews",
    tags=["Customer Reviews"],
)

professional_router = APIRouter(
    prefix="/professionals",
    tags=["Professional Reviews"],
)


@customer_router.get(
    "",
    response_model=list[ReviewResponse],
)
def list_my_reviews(
    current_user: User = Depends(require_role("CUSTOMER")),
    db: Session = Depends(get_db),
):
    profile = get_customer_profile(
        db=db,
        user_id=current_user.id,
    )

    if profile is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer profile not found",
        )

    return get_customer_reviews(
        db=db,
        customer_profile_id=profile.id,
    )


@customer_router.post(
    "/booking/{booking_id}",
    response_model=ReviewResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_booking_review(
    booking_id: int,
    request: ReviewCreate,
    current_user: User = Depends(require_role("CUSTOMER")),
    db: Session = Depends(get_db),
):
    profile = get_customer_profile(
        db=db,
        user_id=current_user.id,
    )

    if profile is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer profile not found",
        )

    booking = get_customer_booking(
        db=db,
        booking_id=booking_id,
        customer_profile_id=profile.id,
    )

    if booking is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found",
        )

    try:
        review = create_review(
            db=db,
            booking=booking,
            customer_profile_id=profile.id,
            rating=request.rating,
            comment=request.comment,
        )

        professional = db.get(
            ProfessionalProfile,
            review.professional_profile_id,
        )

        if professional is not None:
            create_notification(
                db=db,
                user_id=professional.user_id,
                notification_type="REVIEW_RECEIVED",
                title="New review received",
                message=(
                    f"You received a {review.rating}-star review."
                ),
            )

        db.commit()
        db.refresh(review)

        return review

    except ValueError as error:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error),
        )


@professional_router.get(
    "/{professional_profile_id}/reviews",
    response_model=list[ReviewResponse],
)
def list_professional_reviews(
    professional_profile_id: int,
    db: Session = Depends(get_db),
):
    return get_professional_reviews(
        db=db,
        professional_profile_id=professional_profile_id,
    )