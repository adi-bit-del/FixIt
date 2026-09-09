from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import require_role
from app.models import ProfessionalProfile, ServiceRequest, User
from app.schemas.service_request import (
    ServiceRequestCreate,
    ServiceRequestResponse,
)
from app.services.customer_service import get_customer_profile
from app.services.notification import create_notification
from app.services.service_request import (
    accept_service_request,
    cancel_service_request,
    create_service_request,
    get_customer_request,
    get_customer_requests,
    get_professional_request,
    reject_service_request,
)


router = APIRouter(
    prefix="/requests",
    tags=["Service Requests"],
)


customer_router = APIRouter(
    prefix="/customer/requests",
    tags=["Customer Service Requests"],
)


professional_router = APIRouter(
    prefix="/professional/requests",
    tags=["Professional Service Requests"],
)


def get_customer(
    current_user: User,
    db: Session,
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

    return profile


def get_professional(
    current_user: User,
) -> ProfessionalProfile:
    profile = current_user.professional_profile

    if profile is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Professional profile not found",
        )

    return profile


@customer_router.get(
    "",
    response_model=list[ServiceRequestResponse],
)
def list_my_requests(
    current_user: User = Depends(require_role("CUSTOMER")),
    db: Session = Depends(get_db),
):
    customer = get_customer(
        current_user=current_user,
        db=db,
    )

    return get_customer_requests(
        db=db,
        customer_profile_id=customer.id,
    )


@customer_router.post(
    "",
    response_model=ServiceRequestResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_request(
    request: ServiceRequestCreate,
    current_user: User = Depends(require_role("CUSTOMER")),
    db: Session = Depends(get_db),
):
    customer = get_customer(
        current_user=current_user,
        db=db,
    )

    try:
        service_request = create_service_request(
            db=db,
            customer_profile_id=customer.id,
            professional_profile_id=request.professional_profile_id,
            service_id=request.service_id,
            address_id=request.address_id,
            description=request.description,
            preferred_date=request.preferred_date,
        )

        professional = db.get(
            ProfessionalProfile,
            service_request.professional_profile_id,
        )

        if professional is not None:
            create_notification(
                db=db,
                user_id=professional.user_id,
                notification_type="REQUEST_CREATED",
                title="New service request",
                message="You have received a new service request.",
            )

        db.commit()
        db.refresh(service_request)

        return service_request

    except ValueError as error:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error),
        )


@customer_router.get(
    "/{request_id}",
    response_model=ServiceRequestResponse,
)
def get_my_request(
    request_id: int,
    current_user: User = Depends(require_role("CUSTOMER")),
    db: Session = Depends(get_db),
):
    customer = get_customer(
        current_user=current_user,
        db=db,
    )

    service_request = get_customer_request(
        db=db,
        request_id=request_id,
        customer_profile_id=customer.id,
    )

    if service_request is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service request not found",
        )

    return service_request


@customer_router.post(
    "/{request_id}/cancel",
    response_model=ServiceRequestResponse,
)
def cancel_request(
    request_id: int,
    current_user: User = Depends(require_role("CUSTOMER")),
    db: Session = Depends(get_db),
):
    customer = get_customer(
        current_user=current_user,
        db=db,
    )

    service_request = get_customer_request(
        db=db,
        request_id=request_id,
        customer_profile_id=customer.id,
    )

    if service_request is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service request not found",
        )

    try:
        service_request = cancel_service_request(
            db=db,
            service_request=service_request,
        )

        db.commit()
        db.refresh(service_request)

        return service_request

    except ValueError as error:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error),
        )


@professional_router.get(
    "",
    response_model=list[ServiceRequestResponse],
)
def list_professional_requests(
    current_user: User = Depends(require_role("PROFESSIONAL")),
    db: Session = Depends(get_db),
):
    professional = get_professional(current_user)

    return list(
        db.scalars(
            select(ServiceRequest)
            .where(
                ServiceRequest.professional_profile_id
                == professional.id
            )
            .order_by(
                ServiceRequest.created_at.desc()
            )
        ).all()
    )


@professional_router.post(
    "/{request_id}/accept",
    response_model=ServiceRequestResponse,
)
def accept_request(
    request_id: int,
    current_user: User = Depends(require_role("PROFESSIONAL")),
    db: Session = Depends(get_db),
):
    professional = get_professional(current_user)

    service_request = get_professional_request(
        db=db,
        request_id=request_id,
        professional_profile_id=professional.id,
    )

    if service_request is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service request not found",
        )

    try:
        service_request = accept_service_request(
            db=db,
            service_request=service_request,
        )

        customer = get_customer_profile(
            db=db,
            user_id=service_request.customer_profile.user_id,
        )

        if customer is not None:
            create_notification(
                db=db,
                user_id=customer.user_id,
                notification_type="REQUEST_ACCEPTED",
                title="Request accepted",
                message=(
                    "Your service request has been accepted "
                    "by the professional."
                ),
            )

        db.commit()
        db.refresh(service_request)

        return service_request

    except ValueError as error:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error),
        )


@professional_router.post(
    "/{request_id}/reject",
    response_model=ServiceRequestResponse,
)
def reject_request(
    request_id: int,
    current_user: User = Depends(require_role("PROFESSIONAL")),
    db: Session = Depends(get_db),
):
    professional = get_professional(current_user)

    service_request = get_professional_request(
        db=db,
        request_id=request_id,
        professional_profile_id=professional.id,
    )

    if service_request is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service request not found",
        )

    try:
        service_request = reject_service_request(
            db=db,
            service_request=service_request,
        )

        customer = get_customer_profile(
            db=db,
            user_id=service_request.customer_profile.user_id,
        )

        if customer is not None:
            create_notification(
                db=db,
                user_id=customer.user_id,
                notification_type="REQUEST_REJECTED",
                title="Request rejected",
                message="Your service request was rejected by the professional.",
            )

        db.commit()
        db.refresh(service_request)

        return service_request

    except ValueError as error:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error),
        )