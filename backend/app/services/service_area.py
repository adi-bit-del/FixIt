from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import ProfessionalServiceArea


def get_service_areas(
    db: Session,
    professional_profile_id: int,
) -> list[ProfessionalServiceArea]:
    return list(
        db.scalars(
            select(ProfessionalServiceArea)
            .where(
                ProfessionalServiceArea.professional_profile_id
                == professional_profile_id
            )
            .order_by(ProfessionalServiceArea.created_at.desc())
        ).all()
    )


def get_service_area(
    db: Session,
    service_area_id: int,
    professional_profile_id: int,
) -> ProfessionalServiceArea | None:
    return db.scalar(
        select(ProfessionalServiceArea).where(
            ProfessionalServiceArea.id == service_area_id,
            ProfessionalServiceArea.professional_profile_id
            == professional_profile_id,
        )
    )


def create_service_area(
    db: Session,
    professional_profile_id: int,
    city: str,
    state: str,
    postal_code: str | None,
    latitude: Decimal | None,
    longitude: Decimal | None,
    radius_km: Decimal,
) -> ProfessionalServiceArea:
    area = ProfessionalServiceArea(
        professional_profile_id=professional_profile_id,
        city=city,
        state=state,
        postal_code=postal_code,
        latitude=latitude,
        longitude=longitude,
        radius_km=radius_km,
    )

    db.add(area)
    db.flush()

    return area


def update_service_area(
    db: Session,
    service_area: ProfessionalServiceArea,
    update_data: dict,
) -> ProfessionalServiceArea:
    for field, value in update_data.items():
        setattr(service_area, field, value)

    db.flush()

    return service_area


def delete_service_area(
    db: Session,
    service_area: ProfessionalServiceArea,
) -> None:
    db.delete(service_area)
    db.flush()