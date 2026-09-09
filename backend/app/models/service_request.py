from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.models.address import Address
    from app.models.professional import ProfessionalProfile
    from app.models.service import Service
    from app.models.customer import CustomerProfile


class ServiceRequest(Base):
    __tablename__ = "service_requests"

    id: Mapped[int] = mapped_column(
        primary_key=True,
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

    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    preferred_date: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="PENDING",
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

    customer_profile: Mapped["CustomerProfile"] = relationship()

    professional_profile: Mapped["ProfessionalProfile"] = relationship()

    service: Mapped["Service"] = relationship()

    address: Mapped["Address"] = relationship()