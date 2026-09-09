from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import (
    Address,
    CustomerProfile,
    ProfessionalProfile,
    ProfessionalService,
    Service,
    ServiceRequest,
)


# ============================================================================
# CUSTOMER REQUESTS
# ============================================================================


def get_customer_requests(
    db: Session,
    customer_profile_id: int,
) -> list[ServiceRequest]:
    return list(
        db.scalars(
            select(ServiceRequest)
            .where(
                ServiceRequest.customer_profile_id
                == customer_profile_id
            )
            .order_by(ServiceRequest.created_at.desc())
        ).all()
    )


def get_customer_request(
    db: Session,
    request_id: int,
    customer_profile_id: int,
) -> ServiceRequest | None:
    return db.scalar(
        select(ServiceRequest).where(
            ServiceRequest.id == request_id,
            ServiceRequest.customer_profile_id
            == customer_profile_id,
        )
    )


# ============================================================================
# PROFESSIONAL REQUESTS
# ============================================================================


def get_professional_request(
    db: Session,
    request_id: int,
    professional_profile_id: int,
) -> ServiceRequest | None:
    return db.scalar(
        select(ServiceRequest).where(
            ServiceRequest.id == request_id,
            ServiceRequest.professional_profile_id
            == professional_profile_id,
        )
    )


# ============================================================================
# ADMIN REQUESTS
# ============================================================================


def get_admin_service_requests(
    db: Session,
) -> list[dict]:
    rows = db.execute(
        select(
            ServiceRequest,
            CustomerProfile,
            ProfessionalProfile,
            Service,
        )
        .join(
            CustomerProfile,
            ServiceRequest.customer_profile_id
            == CustomerProfile.id,
        )
        .join(
            ProfessionalProfile,
            ServiceRequest.professional_profile_id
            == ProfessionalProfile.id,
        )
        .join(
            Service,
            ServiceRequest.service_id
            == Service.id,
        )
        .order_by(
            ServiceRequest.created_at.desc(),
        )
    ).all()

    requests: list[dict] = []

    for (
        service_request,
        customer_profile,
        professional_profile,
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
            customer_name = (
                f"Customer #{customer_profile.id}"
            )

        requests.append(
            {
                "id": service_request.id,
                "customer_profile_id": customer_profile.id,
                "customer_name": customer_name,
                "professional_profile_id": (
                    professional_profile.id
                ),
                "professional_name": (
                    professional_profile.business_name
                ),
                "service_id": service.id,
                "service_name": service.name,
                "address_id": service_request.address_id,
                "description": service_request.description,
                "preferred_date": (
                    service_request.preferred_date
                ),
                "status": service_request.status,
                "created_at": (
                    service_request.created_at
                ),
                "updated_at": (
                    service_request.updated_at
                ),
            }
        )

    return requests


# ============================================================================
# CREATE REQUEST
# ============================================================================


def create_service_request(
    db: Session,
    customer_profile_id: int,
    professional_profile_id: int,
    service_id: int,
    address_id: int,
    description: str | None,
    preferred_date,
) -> ServiceRequest:

    address = db.scalar(
        select(Address).where(
            Address.id == address_id,
            Address.customer_profile_id
            == customer_profile_id,
        )
    )

    if address is None:
        raise ValueError("Address not found")

    professional = db.scalar(
        select(ProfessionalProfile).where(
            ProfessionalProfile.id == professional_profile_id,
            ProfessionalProfile.verification_status == "VERIFIED",
        )
    )

    if professional is None:
        raise ValueError(
            "Professional not found or not verified"
        )

    professional_service = db.scalar(
        select(ProfessionalService).where(
            ProfessionalService.professional_profile_id
            == professional_profile_id,
            ProfessionalService.service_id == service_id,
            ProfessionalService.is_active.is_(True),
        )
    )

    if professional_service is None:
        raise ValueError(
            "Professional does not offer this service"
        )

    request = ServiceRequest(
        customer_profile_id=customer_profile_id,
        professional_profile_id=professional_profile_id,
        service_id=service_id,
        address_id=address_id,
        description=description,
        preferred_date=preferred_date,
        status="PENDING",
    )

    db.add(request)
    db.flush()

    return request


# ============================================================================
# PROFESSIONAL REQUEST ACTIONS
# ============================================================================


def accept_service_request(
    db: Session,
    service_request: ServiceRequest,
) -> ServiceRequest:
    if service_request.status != "PENDING":
        raise ValueError(
            "Only pending requests can be accepted"
        )

    service_request.status = "ACCEPTED"

    db.flush()

    return service_request


def reject_service_request(
    db: Session,
    service_request: ServiceRequest,
) -> ServiceRequest:
    if service_request.status != "PENDING":
        raise ValueError(
            "Only pending requests can be rejected"
        )

    service_request.status = "REJECTED"

    db.flush()

    return service_request


# ============================================================================
# CUSTOMER REQUEST ACTIONS
# ============================================================================


def cancel_service_request(
    db: Session,
    service_request: ServiceRequest,
) -> ServiceRequest:
    if service_request.status not in {
        "PENDING",
        "ACCEPTED",
    }:
        raise ValueError(
            "This request cannot be cancelled"
        )

    service_request.status = "CANCELLED"

    db.flush()

    return service_request