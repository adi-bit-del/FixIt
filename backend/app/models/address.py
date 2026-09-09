from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import (
    Boolean,
    DateTime,
    ForeignKey,
    Index,
    Numeric,
    String,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.models.customer import CustomerProfile


class Address(Base):
    __tablename__ = "addresses"

    id: Mapped[int] = mapped_column(
        primary_key=True,
    )

    customer_profile_id: Mapped[int] = mapped_column(
        ForeignKey(
            "customer_profiles.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    label: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )

    address_line_1: Mapped[str] = mapped_column(
        String(200),
        nullable=False,
    )

    address_line_2: Mapped[str | None] = mapped_column(
        String(200),
        nullable=True,
    )

    landmark: Mapped[str | None] = mapped_column(
        String(150),
        nullable=True,
    )

    city: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    state: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    postal_code: Mapped[str] = mapped_column(
        String(10),
        nullable=False,
    )

    latitude: Mapped[float | None] = mapped_column(
        Numeric(9, 6),
        nullable=True,
    )

    longitude: Mapped[float | None] = mapped_column(
        Numeric(9, 6),
        nullable=True,
    )

    is_default: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
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

    customer_profile: Mapped["CustomerProfile"] = relationship(
        back_populates="addresses",
    )


Index(
    "uq_one_default_address_per_customer",
    Address.customer_profile_id,
    unique=True,
    postgresql_where=Address.is_default.is_(True),
)