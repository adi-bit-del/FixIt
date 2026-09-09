from datetime import datetime
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, Numeric, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.models.address import Address
    from app.models.customer import CustomerProfile
    from app.models.professional import ProfessionalProfile
    from app.models.quote import Quote
    from app.models.service import Service
    from app.models.service_request import ServiceRequest


class Booking(Base):
    __tablename__ = "bookings"

    id: Mapped[int] = mapped_column(
        primary_key=True,
    )

    service_request_id: Mapped[int] = mapped_column(
        ForeignKey(
            "service_requests.id",
            ondelete="RESTRICT",
        ),
        nullable=False,
        unique=True,
    )

    quote_id: Mapped[int] = mapped_column(
        ForeignKey(
            "quotes.id",
            ondelete="RESTRICT",
        ),
        nullable=False,
        unique=True,
    )

    customer_profile_id: Mapped[int] = mapped_column(
        ForeignKey(
            "customer_profiles.id",
            ondelete="RESTRICT",
        ),
        nullable=False,
        index=True,
    )

    professional_profile_id: Mapped[int] = mapped_column(
        ForeignKey(
            "professional_profiles.id",
            ondelete="RESTRICT",
        ),
        nullable=False,
        index=True,
    )

    service_id: Mapped[int] = mapped_column(
        ForeignKey(
            "services.id",
            ondelete="RESTRICT",
        ),
        nullable=False,
        index=True,
    )

    address_id: Mapped[int] = mapped_column(
        ForeignKey(
            "addresses.id",
            ondelete="RESTRICT",
        ),
        nullable=False,
        index=True,
    )

    amount: Mapped[Decimal] = mapped_column(
        Numeric(10, 2),
        nullable=False,
    )

    scheduled_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
    )

    status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="CONFIRMED",
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    service_request: Mapped["ServiceRequest"] = relationship()
    quote: Mapped["Quote"] = relationship()
    customer_profile: Mapped["CustomerProfile"] = relationship()
    professional_profile: Mapped["ProfessionalProfile"] = relationship()
    service: Mapped["Service"] = relationship()
    address: Mapped["Address"] = relationship()