from datetime import datetime
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import (
    Boolean,
    DateTime,
    ForeignKey,
    Numeric,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.models.professional import ProfessionalProfile
    from app.models.service import Service


class ProfessionalService(Base):
    __tablename__ = "professional_services"
    __table_args__ = (
        UniqueConstraint(
            "professional_profile_id",
            "service_id",
            name="uq_professional_service",
        ),
    )

    id: Mapped[int] = mapped_column(
        primary_key=True,
    )

    professional_profile_id: Mapped[int] = mapped_column(
        ForeignKey(
            "professional_profiles.id",
            ondelete="CASCADE",
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

    custom_price: Mapped[Decimal | None] = mapped_column(
        Numeric(10, 2),
        nullable=True,
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
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

    professional_profile: Mapped["ProfessionalProfile"] = relationship(
        back_populates="professional_services",
    )

    service: Mapped["Service"] = relationship(
        back_populates="professional_services",
    )