from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import require_role
from app.models import ProfessionalProfile, User
from app.schemas.booking import BookingCreate, BookingResponse
from app.services.booking import (
    cancel_booking,
    complete_booking,
    create_booking_from_quote,
    get_customer_booking,
    get_customer_bookings,
    get_professional_booking,
    get_professional_bookings,
    mark_booking_in_progress,
)
from app.services.customer_service import get_customer_profile
from app.services.notification import create_notification
from app.services.professional_profile_service import (
    get_current_professional_profile,
)
from app.services.quote import get_customer_quote


customer_router = APIRouter(
    prefix="/customer/bookings",
    tags=["Customer Bookings"],
)

professional_router = APIRouter(
    prefix="/professional/bookings",
    tags=["Professional Bookings"],
)


@customer_router.get(
    "",
    response_model=list[BookingResponse],
)
def list_my_bookings(
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

    return get_customer_bookings(
        db=db,
        customer_profile_id=profile.id,
    )


@customer_router.post(
    "/quote/{quote_id}",
    response_model=BookingResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_booking(
    quote_id: int,
    request: BookingCreate,
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

    quote = get_customer_quote(
        db=db,
        quote_id=quote_id,
        customer_profile_id=profile.id,
    )

    if quote is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Quote not found",
        )

    try:
        booking = create_booking_from_quote(
            db=db,
            quote=quote,
            customer_profile_id=profile.id,
            scheduled_at=request.scheduled_at,
        )

        professional = db.get(
            ProfessionalProfile,
            booking.professional_profile_id,
        )

        if professional is not None:
            create_notification(
                db=db,
                user_id=professional.user_id,
                notification_type="BOOKING_CONFIRMED",
                title="Booking confirmed",
                message=(
                    f"A booking has been confirmed "
                    f"for ₹{booking.amount}."
                ),
            )

        db.commit()
        db.refresh(booking)

        return booking

    except ValueError as error:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error),
        )


@customer_router.get(
    "/{booking_id}",
    response_model=BookingResponse,
)
def get_my_booking(
    booking_id: int,
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

    return booking


@customer_router.post(
    "/{booking_id}/cancel",
    response_model=BookingResponse,
)
def cancel_my_booking(
    booking_id: int,
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
        booking = cancel_booking(
            db=db,
            booking=booking,
        )

        db.commit()
        db.refresh(booking)

        return booking

    except ValueError as error:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error),
        )


@professional_router.get(
    "",
    response_model=list[BookingResponse],
)
def list_professional_bookings(
    current_user: User = Depends(require_role("PROFESSIONAL")),
    db: Session = Depends(get_db),
):
    profile = get_current_professional_profile(
        db=db,
        user_id=current_user.id,
    )

    if profile is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Professional profile not found",
        )

    return get_professional_bookings(
        db=db,
        professional_profile_id=profile.id,
    )


@professional_router.post(
    "/{booking_id}/start",
    response_model=BookingResponse,
)
def start_booking(
    booking_id: int,
    current_user: User = Depends(require_role("PROFESSIONAL")),
    db: Session = Depends(get_db),
):
    profile = get_current_professional_profile(
        db=db,
        user_id=current_user.id,
    )

    if profile is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Professional profile not found",
        )

    booking = get_professional_booking(
        db=db,
        booking_id=booking_id,
        professional_profile_id=profile.id,
    )

    if booking is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found",
        )

    try:
        booking = mark_booking_in_progress(
            db=db,
            booking=booking,
        )

        db.commit()
        db.refresh(booking)

        return booking

    except ValueError as error:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error),
        )


@professional_router.post(
    "/{booking_id}/complete",
    response_model=BookingResponse,
)
def finish_booking(
    booking_id: int,
    current_user: User = Depends(require_role("PROFESSIONAL")),
    db: Session = Depends(get_db),
):
    profile = get_current_professional_profile(
        db=db,
        user_id=current_user.id,
    )

    if profile is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Professional profile not found",
        )

    booking = get_professional_booking(
        db=db,
        booking_id=booking_id,
        professional_profile_id=profile.id,
    )

    if booking is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found",
        )

    try:
        booking = complete_booking(
            db=db,
            booking=booking,
        )

        customer = db.get(
            type(booking.customer_profile),
            booking.customer_profile_id,
        )

        if customer is not None:
            create_notification(
                db=db,
                user_id=customer.user_id,
                notification_type="BOOKING_COMPLETED",
                title="Service completed",
                message="Your FixIt service has been completed.",
            )

        db.commit()
        db.refresh(booking)

        return booking

    except ValueError as error:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error),
        )