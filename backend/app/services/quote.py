from datetime import datetime, timezone
from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import (
    CustomerProfile,
    ProfessionalProfile,
    ProfessionalService,
    Quote,
    Service,
    ServiceRequest,
)


def get_customer_quotes(
    db: Session,
    customer_profile_id: int,
) -> list[Quote]:
    return list(
        db.scalars(
            select(Quote)
            .join(
                ServiceRequest,
                Quote.service_request_id == ServiceRequest.id,
            )
            .where(
                ServiceRequest.customer_profile_id
                == customer_profile_id
            )
            .order_by(Quote.created_at.desc())
        ).all()
    )


def get_professional_quotes(
    db: Session,
    professional_profile_id: int,
) -> list[Quote]:
    return list(
        db.scalars(
            select(Quote).where(
                Quote.professional_service_id.in_(
                    select(ProfessionalService.id).where(
                        ProfessionalService.professional_profile_id
                        == professional_profile_id
                    )
                )
            )
            .order_by(Quote.created_at.desc())
        ).all()
    )

def get_admin_quotes(
    db: Session,
) -> list[dict]:
    rows = db.execute(
        select(
            Quote,
            CustomerProfile,
            ProfessionalProfile,
            ProfessionalService,
            Service,
        )
        .join(
            ServiceRequest,
            Quote.service_request_id == ServiceRequest.id,
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
            ProfessionalService,
            Quote.professional_service_id
            == ProfessionalService.id,
        )
        .join(
            Service,
            ProfessionalService.service_id == Service.id,
        )
        .order_by(Quote.created_at.desc())
    ).all()

    result = []

    for (
        quote,
        customer_profile,
        professional_profile,
        professional_service,
        service,
    ) in rows:
        customer_parts = [
            customer_profile.first_name,
            customer_profile.last_name,
        ]

        customer_name = (
            " ".join(
                part for part in customer_parts if part
            )
            or "Customer"
        )

        professional_name = (
            professional_profile.business_name
            or "Professional"
        )

        result.append(
            {
                "id": quote.id,
                "service_request_id": quote.service_request_id,
                "professional_service_id": quote.professional_service_id,
                "customer_profile_id": customer_profile.id,
                "customer_name": customer_name,
                "professional_profile_id": professional_profile.id,
                "professional_name": professional_name,
                "service_id": service.id,
                "service_name": service.name,
                "amount": quote.amount,
                "note": quote.note,
                "status": quote.status,
                "expires_at": quote.expires_at,
                "created_at": quote.created_at,
                "updated_at": quote.updated_at,
            }
        )

    return result

def get_customer_quote(
    db: Session,
    quote_id: int,
    customer_profile_id: int,
) -> Quote | None:
    return db.scalar(
        select(Quote)
        .join(
            ServiceRequest,
            Quote.service_request_id == ServiceRequest.id,
        )
        .where(
            Quote.id == quote_id,
            ServiceRequest.customer_profile_id
            == customer_profile_id,
        )
    )


def get_professional_quote(
    db: Session,
    quote_id: int,
    professional_profile_id: int,
) -> Quote | None:
    return db.scalar(
        select(Quote)
        .join(
            ProfessionalService,
            Quote.professional_service_id == ProfessionalService.id,
        )
        .where(
            Quote.id == quote_id,
            ProfessionalService.professional_profile_id
            == professional_profile_id,
        )
    )


def create_quote(
    db: Session,
    service_request_id: int,
    professional_profile_id: int,
    professional_service_id: int,
    amount: Decimal,
    note: str | None,
    expires_at: datetime | None,
) -> Quote:
    service_request = db.scalar(
        select(ServiceRequest).where(
            ServiceRequest.id == service_request_id,
            ServiceRequest.professional_profile_id
            == professional_profile_id,
        )
    )

    if service_request is None:
        raise ValueError("Service request not found")

    if service_request.status != "ACCEPTED":
        raise ValueError(
            "Quote can only be created for an accepted request"
        )

    professional_service = db.scalar(
        select(ProfessionalService).where(
            ProfessionalService.id == professional_service_id,
            ProfessionalService.professional_profile_id
            == professional_profile_id,
            ProfessionalService.is_active.is_(True),
        )
    )

    if professional_service is None:
        raise ValueError(
            "Professional service not found or inactive"
        )

    if professional_service.service_id != service_request.service_id:
        raise ValueError(
            "Professional service does not match the request"
        )

    existing_pending_quote = db.scalar(
        select(Quote).where(
            Quote.service_request_id == service_request_id,
            Quote.status == "PENDING",
        )
    )

    if existing_pending_quote is not None:
        raise ValueError(
            "A pending quote already exists for this request"
        )

    quote = Quote(
        service_request_id=service_request_id,
        professional_service_id=professional_service_id,
        amount=amount,
        note=note,
        expires_at=expires_at,
        status="PENDING",
    )

    db.add(quote)
    db.flush()

    return quote


def accept_quote(
    db: Session,
    quote: Quote,
) -> Quote:
    if quote.status != "PENDING":
        raise ValueError(
            "Only pending quotes can be accepted"
        )

    if (
        quote.expires_at is not None
        and quote.expires_at <= datetime.now(timezone.utc)
    ):
        quote.status = "EXPIRED"
        db.flush()

        raise ValueError("Quote has expired")

    quote.status = "ACCEPTED"

    db.flush()

    return quote


def reject_quote(
    db: Session,
    quote: Quote,
) -> Quote:
    if quote.status != "PENDING":
        raise ValueError(
            "Only pending quotes can be rejected"
        )

    quote.status = "REJECTED"

    db.flush()

    return quote