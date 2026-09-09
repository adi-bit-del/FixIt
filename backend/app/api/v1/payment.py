from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import require_role
from app.models import ProfessionalProfile, User
from app.schemas.payment import PaymentCreate, PaymentResponse
from app.services.booking import get_customer_booking
from app.services.customer_service import get_customer_profile
from app.services.notification import create_notification
from app.services.payment import (
    create_payment,
    get_customer_payment,
    get_customer_payments,
)


router = APIRouter(
    prefix="/customer/payments",
    tags=["Customer Payments"],
)


@router.get(
    "",
    response_model=list[PaymentResponse],
)
def list_my_payments(
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

    return get_customer_payments(
        db=db,
        customer_profile_id=profile.id,
    )


@router.post(
    "/booking/{booking_id}",
    response_model=PaymentResponse,
    status_code=status.HTTP_201_CREATED,
)
def make_payment(
    booking_id: int,
    request: PaymentCreate,
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
        payment = create_payment(
            db=db,
            booking=booking,
            payment_method=request.payment_method,
            simulate_result=request.simulate_result,
        )

        if payment.status == "SUCCESS":
            professional = db.get(
                ProfessionalProfile,
                booking.professional_profile_id,
            )

            if professional is not None:
                create_notification(
                    db=db,
                    user_id=professional.user_id,
                    notification_type="PAYMENT_SUCCESS",
                    title="Payment received",
                    message=(
                        f"Payment of ₹{payment.amount} "
                        "was successful."
                    ),
                )

        db.commit()
        db.refresh(payment)

        return payment

    except ValueError as error:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error),
        )


@router.get(
    "/{payment_id}",
    response_model=PaymentResponse,
)
def get_my_payment(
    payment_id: int,
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

    payment = get_customer_payment(
        db=db,
        payment_id=payment_id,
        customer_profile_id=profile.id,
    )

    if payment is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment not found",
        )

    return payment