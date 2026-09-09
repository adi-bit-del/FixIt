from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import ProfessionalProfile


def get_professional_profiles(
    db: Session,
) -> list[ProfessionalProfile]:
    return list(
        db.scalars(
            select(ProfessionalProfile)
            .order_by(ProfessionalProfile.created_at.desc())
        ).all()
    )


def get_professional_profile_by_id(
    db: Session,
    professional_profile_id: int,
) -> ProfessionalProfile | None:
    return db.scalar(
        select(ProfessionalProfile).where(
            ProfessionalProfile.id == professional_profile_id
        )
    )


def get_current_professional_profile(
    db: Session,
    user_id: int,
) -> ProfessionalProfile | None:
    return db.scalar(
        select(ProfessionalProfile).where(
            ProfessionalProfile.user_id == user_id
        )
    )


def update_verification_status(
    db: Session,
    profile: ProfessionalProfile,
    verification_status: str,
) -> ProfessionalProfile:
    profile.verification_status = verification_status

    db.flush()

    return profile