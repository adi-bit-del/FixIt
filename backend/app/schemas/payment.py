from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, Field


PaymentMethod = Literal[
    "MOCK_CARD",
    "MOCK_UPI",
    "MOCK_CASH",
]


class PaymentCreate(BaseModel):
    payment_method: PaymentMethod = "MOCK_CARD"

    simulate_result: Literal[
        "SUCCESS",
        "FAILED",
    ] = Field(
        default="SUCCESS",
    )


class PaymentResponse(BaseModel):
    id: int
    booking_id: int
    amount: Decimal
    payment_method: str
    transaction_reference: str
    status: str

    model_config = {
        "from_attributes": True,
    }


class AdminPaymentResponse(BaseModel):
    id: int
    booking_id: int

    customer_profile_id: int
    customer_name: str

    professional_profile_id: int
    professional_name: str

    service_id: int
    service_name: str

    amount: Decimal
    payment_method: str
    transaction_reference: str
    status: str