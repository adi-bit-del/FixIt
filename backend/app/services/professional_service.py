from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import ProfessionalService, Service

from app.models import ProfessionalProfile

def get_professional_services(
    db: Session,
    professional_profile_id: int,
) -> list[ProfessionalService]:
    return list(
        db.scalars(
            select(ProfessionalService)
            .where(
                ProfessionalService.professional_profile_id
                == professional_profile_id
            )
            .order_by(ProfessionalService.created_at.desc())
        ).all()
    )


def get_professional_service(
    db: Session,
    professional_service_id: int,
    professional_profile_id: int,
) -> ProfessionalService | None:
    return db.scalar(
        select(ProfessionalService).where(
            ProfessionalService.id == professional_service_id,
            ProfessionalService.professional_profile_id
            == professional_profile_id,
        )
    )


def create_professional_service(
    db: Session,
    professional_profile_id: int,
    service_id: int,
    custom_price: Decimal | None,
) -> ProfessionalService:
    service = db.scalar(
        select(Service).where(
            Service.id == service_id,
            Service.is_active.is_(True),
        )
    )

    if service is None:
        raise ValueError("Service not found or inactive")

    existing = db.scalar(
        select(ProfessionalService).where(
            ProfessionalService.professional_profile_id
            == professional_profile_id,
            ProfessionalService.service_id == service_id,
        )
    )

    if existing is not None:
        raise ValueError("Professional already offers this service")

    professional_service = ProfessionalService(
        professional_profile_id=professional_profile_id,
        service_id=service_id,
        custom_price=custom_price,
    )

    db.add(professional_service)
    db.flush()

    return professional_service


def update_professional_service(
    db: Session,
    professional_service: ProfessionalService,
    update_data: dict,
) -> ProfessionalService:
    for field, value in update_data.items():
        setattr(professional_service, field, value)

    db.flush()

    return professional_service


def delete_professional_service(
    db: Session,
    professional_service: ProfessionalService,
) -> None:
    db.delete(professional_service)
    db.flush()

def get_current_professional_profile(
    db: Session,
    user_id: int,
) -> ProfessionalProfile | None:
    return db.scalar(
        select(ProfessionalProfile).where(
            ProfessionalProfile.user_id == user_id
        )
    )