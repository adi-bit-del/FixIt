from datetime import datetime
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, Numeric, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.models.professional import ProfessionalProfile


class ProfessionalServiceArea(Base):
    __tablename__ = "professional_service_areas"

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

    city: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    state: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    postal_code: Mapped[str | None] = mapped_column(
        String(10),
        nullable=True,
        index=True,
    )

    latitude: Mapped[Decimal | None] = mapped_column(
        Numeric(9, 6),
        nullable=True,
    )

    longitude: Mapped[Decimal | None] = mapped_column(
        Numeric(9, 6),
        nullable=True,
    )

    radius_km: Mapped[Decimal] = mapped_column(
        Numeric(6, 2),
        nullable=False,
        default=5,
    )

    is_active: Mapped[bool] = mapped_column(
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
        back_populates="service_areas",
    )