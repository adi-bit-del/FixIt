from decimal import Decimal
from uuid import uuid4

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import (
    Booking,
    CustomerProfile,
    Payment,
    ProfessionalProfile,
    Service,
)


class PaymentGateway:
    def process_payment(
        self,
        amount: Decimal,
        payment_method: str,
        simulate_result: str,
    ) -> tuple[str, str]:
        raise NotImplementedError


class MockPaymentGateway(PaymentGateway):
    def process_payment(
        self,
        amount: Decimal,
        payment_method: str,
        simulate_result: str,
    ) -> tuple[str, str]:
        transaction_reference = (
            f"MOCK-TXN-{uuid4().hex[:12].upper()}"
        )

        if simulate_result == "SUCCESS":
            return "SUCCESS", transaction_reference

        return "FAILED", transaction_reference


mock_gateway = MockPaymentGateway()


def get_customer_payments(
    db: Session,
    customer_profile_id: int,
) -> list[Payment]:
    return list(
        db.scalars(
            select(Payment)
            .join(
                Booking,
                Payment.booking_id == Booking.id,
            )
            .where(
                Booking.customer_profile_id
                == customer_profile_id
            )
            .order_by(Payment.created_at.desc())
        ).all()
    )

def get_admin_payments(
    db: Session,
) -> list[dict]:
    rows = db.execute(
        select(
            Payment,
            Booking,
            CustomerProfile,
            ProfessionalProfile,
            Service,
        )
        .join(
            Booking,
            Payment.booking_id == Booking.id,
        )
        .join(
            CustomerProfile,
            Booking.customer_profile_id
            == CustomerProfile.id,
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
        .order_by(Payment.id.desc())
    ).all()

    result = []

    for (
        payment,
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
                "id": payment.id,
                "booking_id": booking.id,
                "customer_profile_id": customer_profile.id,
                "customer_name": customer_name,
                "professional_profile_id": professional_profile.id,
                "professional_name": professional_name,
                "service_id": service.id,
                "service_name": service.name,
                "amount": payment.amount,
                "payment_method": payment.payment_method,
                "transaction_reference": (
                    payment.transaction_reference
                ),
                "status": payment.status,
            }
        )

    return result

def get_customer_payment(
    db: Session,
    payment_id: int,
    customer_profile_id: int,
) -> Payment | None:
    return db.scalar(
        select(Payment)
        .join(
            Booking,
            Payment.booking_id == Booking.id,
        )
        .where(
            Payment.id == payment_id,
            Booking.customer_profile_id
            == customer_profile_id,
        )
    )


def create_payment(
    db: Session,
    booking: Booking,
    payment_method: str,
    simulate_result: str,
) -> Payment:
    if booking.status != "CONFIRMED":
        raise ValueError(
            "Payment can only be made for a confirmed booking"
        )

    existing_payment = db.scalar(
        select(Payment).where(
            Payment.booking_id == booking.id
        )
    )

    if existing_payment is not None:
        raise ValueError(
            "A payment already exists for this booking"
        )

    payment_status, transaction_reference = (
        mock_gateway.process_payment(
            amount=booking.amount,
            payment_method=payment_method,
            simulate_result=simulate_result,
        )
    )

    payment = Payment(
        booking_id=booking.id,
        amount=booking.amount,
        payment_method=payment_method,
        transaction_reference=transaction_reference,
        status=payment_status,
    )

    db.add(payment)
    db.flush()

    return payment