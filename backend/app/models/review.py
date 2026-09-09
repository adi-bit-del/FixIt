from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import (
    CheckConstraint,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.models.booking import Booking
    from app.models.customer import CustomerProfile
    from app.models.professional import ProfessionalProfile


class Review(Base):
    __tablename__ = "reviews"

    __table_args__ = (
        CheckConstraint(
            "rating >= 1 AND rating <= 5",
            name="ck_review_rating_range",
        ),
    )

    id: Mapped[int] = mapped_column(
        primary_key=True,
    )

    booking_id: Mapped[int] = mapped_column(
        ForeignKey(
            "bookings.id",
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

    rating: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    comment: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    moderation_status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="VISIBLE",
        server_default="VISIBLE",
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

    booking: Mapped["Booking"] = relationship()
    customer_profile: Mapped["CustomerProfile"] = relationship()
    professional_profile: Mapped["ProfessionalProfile"] = relationship()