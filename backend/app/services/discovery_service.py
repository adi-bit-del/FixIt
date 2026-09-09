from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import (
    ProfessionalProfile,
    ProfessionalService,
    ProfessionalServiceArea,
    Service,
)


def discover_professionals(
    db: Session,
    service_id: int | None = None,
    city: str | None = None,
    postal_code: str | None = None,
):
    query = (
        select(
            ProfessionalProfile.id,
            ProfessionalProfile.business_name,
            ProfessionalProfile.bio,
            ProfessionalProfile.experience_years,
            ProfessionalProfile.phone,
            ProfessionalProfile.profile_image_url,
            ProfessionalProfile.verification_status,
            Service.id.label("service_id"),
            Service.name.label("service_name"),
            ProfessionalService.custom_price,
            Service.base_price,
        )
        .join(
            ProfessionalService,
            ProfessionalService.professional_profile_id
            == ProfessionalProfile.id,
        )
        .join(
            Service,
            Service.id == ProfessionalService.service_id,
        )
        .join(
            ProfessionalServiceArea,
            ProfessionalServiceArea.professional_profile_id
            == ProfessionalProfile.id,
        )
        .where(
            ProfessionalProfile.verification_status == "VERIFIED",
            ProfessionalService.is_active.is_(True),
            Service.is_active.is_(True),
            ProfessionalServiceArea.is_active.is_(True),
        )
    )

    if service_id is not None:
        query = query.where(
            ProfessionalService.service_id == service_id
        )

    if city is not None:
        query = query.where(
            ProfessionalServiceArea.city.ilike(city)
        )

    if postal_code is not None:
        query = query.where(
            ProfessionalServiceArea.postal_code == postal_code
        )

    query = query.order_by(
        ProfessionalProfile.business_name
    )

    results = db.execute(query).all()

    return [
        {
            "id": row.id,
            "business_name": row.business_name,
            "bio": row.bio,
            "experience_years": row.experience_years,
            "phone": row.phone,
            "profile_image_url": row.profile_image_url,
            "verification_status": row.verification_status,
            "service_id": row.service_id,
            "service_name": row.service_name,
            "price": (
                row.custom_price
                if row.custom_price is not None
                else row.base_price
            ),
        }
        for row in results
    ]