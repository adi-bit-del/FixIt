from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import ServiceCategory


def get_categories(
    db: Session,
    include_inactive: bool = False,
) -> list[ServiceCategory]:
    query = select(ServiceCategory)

    if not include_inactive:
        query = query.where(ServiceCategory.is_active.is_(True))

    return list(
        db.scalars(
            query.order_by(ServiceCategory.name)
        ).all()
    )


def get_category(
    db: Session,
    category_id: int,
) -> ServiceCategory | None:
    return db.scalar(
        select(ServiceCategory).where(
            ServiceCategory.id == category_id
        )
    )


def create_category(
    db: Session,
    name: str,
    description: str | None,
) -> ServiceCategory:
    existing_category = db.scalar(
        select(ServiceCategory).where(
            ServiceCategory.name == name
        )
    )

    if existing_category is not None:
        raise ValueError("Category already exists")

    category = ServiceCategory(
        name=name,
        description=description,
    )

    db.add(category)
    db.flush()

    return category


def update_category(
    db: Session,
    category: ServiceCategory,
    update_data: dict,
) -> ServiceCategory:
    for field, value in update_data.items():
        setattr(category, field, value)

    db.flush()

    return category