from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Service, ServiceCategory


def get_services(
    db: Session,
    category_id: int | None = None,
    include_inactive: bool = False,
) -> list[Service]:
    query = select(Service)

    if not include_inactive:
        query = query.where(Service.is_active.is_(True))

    if category_id is not None:
        query = query.where(Service.category_id == category_id)

    return list(
        db.scalars(
            query.order_by(Service.name)
        ).all()
    )


def get_service(
    db: Session,
    service_id: int,
) -> Service | None:
    return db.scalar(
        select(Service).where(
            Service.id == service_id
        )
    )


def create_service(
    db: Session,
    category_id: int,
    name: str,
    description: str | None,
    base_price: Decimal,
) -> Service:
    category = db.scalar(
        select(ServiceCategory).where(
            ServiceCategory.id == category_id
        )
    )

    if category is None:
        raise ValueError("Service category not found")

    if not category.is_active:
        raise ValueError("Cannot create service under an inactive category")

    existing_service = db.scalar(
        select(Service).where(
            Service.category_id == category_id,
            Service.name == name,
        )
    )

    if existing_service is not None:
        raise ValueError("Service already exists in this category")

    service = Service(
        category_id=category_id,
        name=name,
        description=description,
        base_price=base_price,
    )

    db.add(service)
    db.flush()

    return service


def update_service(
    db: Session,
    service: Service,
    update_data: dict,
) -> Service:
    if "category_id" in update_data:
        category = db.scalar(
            select(ServiceCategory).where(
                ServiceCategory.id == update_data["category_id"]
            )
        )

        if category is None:
            raise ValueError("Service category not found")

        if not category.is_active:
            raise ValueError(
                "Cannot move service to an inactive category"
            )

    for field, value in update_data.items():
        setattr(service, field, value)

    db.flush()

    return service