from datetime import datetime
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, Numeric, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.models.professional_service import ProfessionalService
    from app.models.service_request import ServiceRequest


class Quote(Base):
    __tablename__ = "quotes"

    id: Mapped[int] = mapped_column(
        primary_key=True,
    )

    service_request_id: Mapped[int] = mapped_column(
        ForeignKey(
            "service_requests.id",
            ondelete="RESTRICT",
        ),
        nullable=False,
        index=True,
    )

    professional_service_id: Mapped[int] = mapped_column(
        ForeignKey(
            "professional_services.id",
            ondelete="RESTRICT",
        ),
        nullable=False,
        index=True,
    )

    amount: Mapped[Decimal] = mapped_column(
        Numeric(10, 2),
        nullable=False,
    )

    note: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="PENDING",
    )

    expires_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
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

    professional_service: Mapped["ProfessionalService"] = relationship()