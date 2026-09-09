from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import require_role
from app.models import (
    CustomerProfile,
    ProfessionalProfile,
    ServiceRequest,
    User,
)
from app.schemas.quote import QuoteCreate, QuoteResponse
from app.services.customer_service import get_customer_profile
from app.services.notification import create_notification
from app.services.professional_profile_service import (
    get_current_professional_profile,
)
from app.services.quote import (
    accept_quote,
    create_quote,
    get_customer_quote,
    get_customer_quotes,
    get_professional_quotes,
    reject_quote,
)


customer_router = APIRouter(
    prefix="/customer/quotes",
    tags=["Customer Quotes"],
)


professional_router = APIRouter(
    prefix="/professional/quotes",
    tags=["Professional Quotes"],
)


@professional_router.get(
    "",
    response_model=list[QuoteResponse],
)
def list_my_quotes(
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

    return get_professional_quotes(
        db=db,
        professional_profile_id=profile.id,
    )


@professional_router.post(
    "/request/{request_id}",
    response_model=QuoteResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_request_quote(
    request_id: int,
    request: QuoteCreate,
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

    try:
        quote = create_quote(
            db=db,
            service_request_id=request_id,
            professional_profile_id=profile.id,
            professional_service_id=request.professional_service_id,
            amount=request.amount,
            note=request.note,
            expires_at=request.expires_at,
        )

        service_request = db.get(
            ServiceRequest,
            quote.service_request_id,
        )

        if service_request is not None:
            customer_profile = db.get(
                CustomerProfile,
                service_request.customer_profile_id,
            )

            if customer_profile is not None:
                create_notification(
                    db=db,
                    user_id=customer_profile.user_id,
                    notification_type="QUOTE_RECEIVED",
                    title="New quote received",
                    message=(
                        f"You received a new quote of ₹{quote.amount}."
                    ),
                )

        db.commit()
        db.refresh(quote)

        return quote

    except ValueError as error:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error),
        )


@customer_router.get(
    "",
    response_model=list[QuoteResponse],
)
def list_my_quotes(
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

    return get_customer_quotes(
        db=db,
        customer_profile_id=profile.id,
    )


@customer_router.post(
    "/{quote_id}/accept",
    response_model=QuoteResponse,
)
def accept_customer_quote(
    quote_id: int,
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
        quote = accept_quote(
            db=db,
            quote=quote,
        )

        service_request = db.get(
            ServiceRequest,
            quote.service_request_id,
        )

        if service_request is not None:
            professional_profile = db.get(
                ProfessionalProfile,
                service_request.professional_profile_id,
            )

            if professional_profile is not None:
                create_notification(
                    db=db,
                    user_id=professional_profile.user_id,
                    notification_type="QUOTE_ACCEPTED",
                    title="Quote accepted",
                    message="The customer accepted your quote.",
                )

        db.commit()
        db.refresh(quote)

        return quote

    except ValueError as error:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error),
        )


@customer_router.post(
    "/{quote_id}/reject",
    response_model=QuoteResponse,
)
def reject_customer_quote(
    quote_id: int,
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
        quote = reject_quote(
            db=db,
            quote=quote,
        )

        db.commit()
        db.refresh(quote)

        return quote

    except ValueError as error:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error),
        )