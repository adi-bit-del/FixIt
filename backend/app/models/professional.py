from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.models.professional_service import ProfessionalService
    from app.models.service_area import ProfessionalServiceArea
    from app.models.user import User


class ProfessionalProfile(Base):
    __tablename__ = "professional_profiles"

    id: Mapped[int] = mapped_column(
        primary_key=True,
    )

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
    )

    business_name: Mapped[str] = mapped_column(
        String(150),
        nullable=False,
    )

    bio: Mapped[str | None] = mapped_column(
        String(1000),
        nullable=True,
    )

    experience_years: Mapped[int] = mapped_column(
        nullable=False,
        default=0,
    )

    phone: Mapped[str | None] = mapped_column(
        String(20),
        nullable=True,
    )

    profile_image_url: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
    )

    verification_status: Mapped[str] = mapped_column(
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

    user: Mapped["User"] = relationship(
        back_populates="professional_profile",
    )

    professional_services: Mapped[list["ProfessionalService"]] = relationship(
    back_populates="professional_profile",
    cascade="all, delete-orphan",
)
    service_areas: Mapped[list["ProfessionalServiceArea"]] = relationship(
    back_populates="professional_profile",
    cascade="all, delete-orphan",
)