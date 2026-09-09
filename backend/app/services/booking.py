from datetime import datetime

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import (
    Booking,
    CustomerProfile,
    Payment,
    ProfessionalProfile,
    Quote,
    Service,
    ServiceRequest,
)


def get_customer_bookings(
    db: Session,
    customer_profile_id: int,
) -> list[Booking]:
    return list(
        db.scalars(
            select(Booking)
            .where(
                Booking.customer_profile_id == customer_profile_id
            )
            .order_by(Booking.created_at.desc())
        ).all()
    )


def get_professional_bookings(
    db: Session,
    professional_profile_id: int,
) -> list[Booking]:
    return list(
        db.scalars(
            select(Booking)
            .where(
                Booking.professional_profile_id == professional_profile_id
            )
            .order_by(Booking.created_at.desc())
        ).all()
    )

def get_admin_bookings(
    db: Session,
) -> list[dict]:
    rows = db.execute(
        select(
            Booking,
            CustomerProfile,
            ProfessionalProfile,
            Service,
        )
        .join(
            CustomerProfile,
            Booking.customer_profile_id == CustomerProfile.id,
        )
        .join(
            ProfessionalProfile,
            Booking.professional_profile_id
            == ProfessionalProfile.id,
        )
        .join(
            Service,
            Booking.service_id == Service.id,
        )
        .order_by(Booking.created_at.desc())
    ).all()

    result = []

    for (
        booking,
        customer_profile,
        professional_profile,
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
                "id": booking.id,
                "service_request_id": booking.service_request_id,
                "quote_id": booking.quote_id,
                "customer_profile_id": customer_profile.id,
                "customer_name": customer_name,
                "professional_profile_id": professional_profile.id,
                "professional_name": professional_name,
                "service_id": service.id,
                "service_name": service.name,
                "address_id": booking.address_id,
                "amount": booking.amount,
                "scheduled_at": booking.scheduled_at,
                "status": booking.status,
                "created_at": booking.created_at,
                "updated_at": booking.updated_at,
            }
        )

    return result

def get_customer_booking(
    db: Session,
    booking_id: int,
    customer_profile_id: int,
) -> Booking | None:
    return db.scalar(
        select(Booking).where(
            Booking.id == booking_id,
            Booking.customer_profile_id == customer_profile_id,
        )
    )


def get_professional_booking(
    db: Session,
    booking_id: int,
    professional_profile_id: int,
) -> Booking | None:
    return db.scalar(
        select(Booking).where(
            Booking.id == booking_id,
            Booking.professional_profile_id == professional_profile_id,
        )
    )


def create_booking_from_quote(
    db: Session,
    quote: Quote,
    customer_profile_id: int,
    scheduled_at: datetime,
) -> Booking:
    if quote.status != "ACCEPTED":
        raise ValueError(
            "Only accepted quotes can create a booking"
        )

    service_request = db.scalar(
        select(ServiceRequest).where(
            ServiceRequest.id == quote.service_request_id
        )
    )

    if service_request is None:
        raise ValueError("Service request not found")

    if service_request.customer_profile_id != customer_profile_id:
        raise ValueError("Quote does not belong to this customer")

    if service_request.status != "ACCEPTED":
        raise ValueError(
            "The service request is not in an accepted state"
        )

    existing_booking = db.scalar(
        select(Booking).where(
            Booking.quote_id == quote.id
        )
    )

    if existing_booking is not None:
        raise ValueError(
            "A booking already exists for this quote"
        )

    booking = Booking(
        service_request_id=service_request.id,
        quote_id=quote.id,
        customer_profile_id=service_request.customer_profile_id,
        professional_profile_id=service_request.professional_profile_id,
        service_id=service_request.service_id,
        address_id=service_request.address_id,
        amount=quote.amount,
        scheduled_at=scheduled_at,
        status="CONFIRMED",
    )

    db.add(booking)
    db.flush()

    return booking


def mark_booking_in_progress(
    db: Session,
    booking: Booking,
) -> Booking:
    if booking.status != "CONFIRMED":
        raise ValueError(
            "Only confirmed bookings can start"
        )

    payment = db.scalar(
        select(Payment).where(
            Payment.booking_id == booking.id,
            Payment.status == "SUCCESS",
        )
    )

    if payment is None:
        raise ValueError(
            "Booking cannot start until payment is successful"
        )

    booking.status = "IN_PROGRESS"

    db.flush()

    return booking

def complete_booking(
    db: Session,
    booking: Booking,
) -> Booking:
    if booking.status != "IN_PROGRESS":
        raise ValueError(
            "Only in-progress bookings can be completed"
        )

    booking.status = "COMPLETED"
    db.flush()

    return booking


def cancel_booking(
    db: Session,
    booking: Booking,
) -> Booking:
    if booking.status not in {"CONFIRMED", "IN_PROGRESS"}:
        raise ValueError(
            "This booking cannot be cancelled"
        )

    booking.status = "CANCELLED"
    db.flush()

    return booking