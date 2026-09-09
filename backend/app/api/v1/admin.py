from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import require_role
from app.models import (
    Booking,
    CustomerProfile,
    ProfessionalProfile,
    Review,
    Service,
    User,
)
from app.schemas.customer import (
    AdminCustomerResponse,
    AdminCustomerStatusUpdate,
)
from app.schemas.professional import (
    ProfessionalProfileResponse,
    ProfessionalVerificationUpdate,
)
from app.schemas.review import (
    AdminReviewModerationUpdate,
    AdminReviewResponse,
)

from app.schemas.quote import AdminQuoteResponse
from app.services.quote import get_admin_quotes


from app.services.customer_service import get_admin_customers
from app.services.professional_profile_service import (
    get_professional_profile_by_id,
    get_professional_profiles,
    update_verification_status,
)


router = APIRouter(
    prefix="/admin",
    tags=["Admin"],
)


# ============================================================================
# PROFESSIONAL MANAGEMENT
# ============================================================================


@router.get(
    "/professionals",
    response_model=list[ProfessionalProfileResponse],
)
def list_professionals(
    current_user: User = Depends(require_role("ADMIN")),
    db: Session = Depends(get_db),
):
    return get_professional_profiles(
        db=db,
    )


@router.patch(
    "/professionals/{professional_profile_id}/verification",
    response_model=ProfessionalProfileResponse,
)
def verify_professional(
    professional_profile_id: int,
    request: ProfessionalVerificationUpdate,
    current_user: User = Depends(require_role("ADMIN")),
    db: Session = Depends(get_db),
):
    profile = get_professional_profile_by_id(
        db=db,
        professional_profile_id=professional_profile_id,
    )

    if profile is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Professional profile not found",
        )

    profile = update_verification_status(
        db=db,
        profile=profile,
        verification_status=request.verification_status,
    )

    db.commit()
    db.refresh(profile)

    return profile


# ============================================================================
# CUSTOMER MANAGEMENT
# ============================================================================


@router.get(
    "/customers",
    response_model=list[AdminCustomerResponse],
)
def list_customers(
    current_user: User = Depends(require_role("ADMIN")),
    db: Session = Depends(get_db),
):
    return get_admin_customers(
        db=db,
    )


@router.patch(
    "/customers/{customer_profile_id}/status",
    response_model=AdminCustomerResponse,
)
def update_customer_status(
    customer_profile_id: int,
    request: AdminCustomerStatusUpdate,
    current_user: User = Depends(require_role("ADMIN")),
    db: Session = Depends(get_db),
):
    customer = db.scalar(
        select(CustomerProfile).where(
            CustomerProfile.id == customer_profile_id
        )
    )

    if customer is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer profile not found",
        )

    user = db.get(
        User,
        customer.user_id,
    )

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer user account not found",
        )

    user.is_active = request.is_active

    db.commit()

    customers = get_admin_customers(
        db=db,
    )

    customer_data = next(
        (
            item
            for item in customers
            if item["id"] == customer_profile_id
        ),
        None,
    )

    if customer_data is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer profile not found",
        )

    return AdminCustomerResponse(**customer_data)


# ============================================================================
# REVIEW MODERATION
# ============================================================================


@router.get(
    "/reviews",
    response_model=list[AdminReviewResponse],
)
def list_admin_reviews(
    current_user: User = Depends(require_role("ADMIN")),
    db: Session = Depends(get_db),
):
    rows = db.execute(
        select(
            Review,
            CustomerProfile,
            ProfessionalProfile,
            Booking,
            Service,
        )
        .join(
            CustomerProfile,
            Review.customer_profile_id == CustomerProfile.id,
        )
        .join(
            ProfessionalProfile,
            Review.professional_profile_id
            == ProfessionalProfile.id,
        )
        .join(
            Booking,
            Review.booking_id == Booking.id,
        )
        .join(
            Service,
            Booking.service_id == Service.id,
        )
        .order_by(
            Review.created_at.desc(),
        )
    ).all()

    reviews: list[AdminReviewResponse] = []

    for (
        review,
        customer_profile,
        professional_profile,
        booking,
        service,
    ) in rows:
        customer_name = " ".join(
            part
            for part in (
                customer_profile.first_name,
                customer_profile.last_name,
            )
            if part
        ).strip()

        if not customer_name:
            customer_name = f"Customer #{customer_profile.id}"

        reviews.append(
            AdminReviewResponse(
                id=review.id,
                booking_id=booking.id,
                customer_profile_id=customer_profile.id,
                customer_name=customer_name,
                professional_profile_id=professional_profile.id,
                professional_name=professional_profile.business_name,
                service_id=service.id,
                service_name=service.name,
                rating=review.rating,
                comment=review.comment,
                moderation_status=review.moderation_status,
                created_at=review.created_at,
                updated_at=review.updated_at,
            )
        )

    return reviews


@router.patch(
    "/reviews/{review_id}/moderation",
    response_model=AdminReviewResponse,
)
def update_review_moderation(
    review_id: int,
    request: AdminReviewModerationUpdate,
    current_user: User = Depends(require_role("ADMIN")),
    db: Session = Depends(get_db),
):
    review = db.get(
        Review,
        review_id,
    )

    if review is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Review not found",
        )

    review.moderation_status = request.moderation_status

    db.commit()
    db.refresh(review)

    row = db.execute(
        select(
            Review,
            CustomerProfile,
            ProfessionalProfile,
            Booking,
            Service,
        )
        .join(
            CustomerProfile,
            Review.customer_profile_id == CustomerProfile.id,
        )
        .join(
            ProfessionalProfile,
            Review.professional_profile_id
            == ProfessionalProfile.id,
        )
        .join(
            Booking,
            Review.booking_id == Booking.id,
        )
        .join(
            Service,
            Booking.service_id == Service.id,
        )
        .where(
            Review.id == review.id,
        )
    ).one()

    (
        review,
        customer_profile,
        professional_profile,
        booking,
        service,
    ) = row

    customer_name = " ".join(
        part
        for part in (
            customer_profile.first_name,
            customer_profile.last_name,
        )
        if part
    ).strip()

    if not customer_name:
        customer_name = f"Customer #{customer_profile.id}"

    return AdminReviewResponse(
        id=review.id,
        booking_id=booking.id,
        customer_profile_id=customer_profile.id,
        customer_name=customer_name,
        professional_profile_id=professional_profile.id,
        professional_name=professional_profile.business_name,
        service_id=service.id,
        service_name=service.name,
        rating=review.rating,
        comment=review.comment,
        moderation_status=review.moderation_status,
        created_at=review.created_at,
        updated_at=review.updated_at,
    )

from app.schemas.service_request import AdminServiceRequestResponse
from app.services.service_request import get_admin_service_requests

@router.get(
    "/requests",
    response_model=list[AdminServiceRequestResponse],
)
def list_admin_service_requests(
    current_user: User = Depends(require_role("ADMIN")),
    db: Session = Depends(get_db),
):
    return get_admin_service_requests(db=db)

@router.get(
    "/quotes",
    response_model=list[AdminQuoteResponse],
)
def list_admin_quotes(
    current_user: User = Depends(require_role("ADMIN")),
    db: Session = Depends(get_db),
):
    return get_admin_quotes(db=db)

from app.schemas.booking import AdminBookingResponse
from app.services.booking import get_admin_bookings

@router.get(
    "/bookings",
    response_model=list[AdminBookingResponse],
)
def list_admin_bookings(
    current_user: User = Depends(require_role("ADMIN")),
    db: Session = Depends(get_db),
):
    return get_admin_bookings(db=db)

from app.schemas.payment import AdminPaymentResponse
from app.services.payment import get_admin_payments

@router.get(
    "/payments",
    response_model=list[AdminPaymentResponse],
)
def list_admin_payments(
    current_user: User = Depends(require_role("ADMIN")),
    db: Session = Depends(get_db),
):
    return get_admin_payments(db=db)