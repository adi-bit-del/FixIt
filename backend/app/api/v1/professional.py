from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import require_role
from app.models import ProfessionalProfile, User
from app.schemas.professional_service import (
    ProfessionalServiceCreate,
    ProfessionalServiceResponse,
    ProfessionalServiceUpdate,
)
from app.services.professional_service import (
    create_professional_service,
    delete_professional_service,
    get_professional_service,
    get_professional_services,
    update_professional_service,
)


router = APIRouter(
    prefix="/professional",
    tags=["Professional"],
)


def get_professional_profile(
    current_user: User,
) -> ProfessionalProfile:
    profile = current_user.professional_profile

    if profile is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Professional profile not found",
        )

    return profile


# ============================================================================
# PROFESSIONAL PROFILE
# ============================================================================

@router.get(
    "/profile",
    response_model=dict,
)
def get_my_profile(
    current_user: User = Depends(require_role("PROFESSIONAL")),
):
    profile = get_professional_profile(
        current_user=current_user,
    )

    return {
        "id": profile.id,
        "user_id": profile.user_id,
        "business_name": profile.business_name,
        "bio": profile.bio,
        "experience_years": profile.experience_years,
        "phone": profile.phone,
        "profile_image_url": profile.profile_image_url,
        "verification_status": profile.verification_status,
    }


@router.patch(
    "/profile",
    response_model=dict,
)
def update_my_profile(
    request: dict,
    current_user: User = Depends(require_role("PROFESSIONAL")),
    db: Session = Depends(get_db),
):
    profile = get_professional_profile(
        current_user=current_user,
    )

    allowed_fields = {
        "business_name",
        "bio",
        "experience_years",
        "phone",
        "profile_image_url",
    }

    for field, value in request.items():
        if field in allowed_fields:
            setattr(profile, field, value)

    db.commit()
    db.refresh(profile)

    return {
        "id": profile.id,
        "user_id": profile.user_id,
        "business_name": profile.business_name,
        "bio": profile.bio,
        "experience_years": profile.experience_years,
        "phone": profile.phone,
        "profile_image_url": profile.profile_image_url,
        "verification_status": profile.verification_status,
    }


# ============================================================================
# PROFESSIONAL SERVICES
# ============================================================================

@router.get(
    "/services",
    response_model=list[ProfessionalServiceResponse],
)
def list_my_services(
    current_user: User = Depends(require_role("PROFESSIONAL")),
    db: Session = Depends(get_db),
):
    profile = get_professional_profile(
        current_user=current_user,
    )

    return get_professional_services(
        db=db,
        professional_profile_id=profile.id,
    )


@router.post(
    "/services",
    response_model=ProfessionalServiceResponse,
    status_code=status.HTTP_201_CREATED,
)
def add_my_service(
    request: ProfessionalServiceCreate,
    current_user: User = Depends(require_role("PROFESSIONAL")),
    db: Session = Depends(get_db),
):
    profile = get_professional_profile(
        current_user=current_user,
    )

    try:
        professional_service = create_professional_service(
            db=db,
            professional_profile_id=profile.id,
            service_id=request.service_id,
            custom_price=request.custom_price,
        )

        db.commit()
        db.refresh(professional_service)

        return professional_service

    except ValueError as error:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error),
        )


@router.patch(
    "/services/{professional_service_id}",
    response_model=ProfessionalServiceResponse,
)
def update_my_service(
    professional_service_id: int,
    request: ProfessionalServiceUpdate,
    current_user: User = Depends(require_role("PROFESSIONAL")),
    db: Session = Depends(get_db),
):
    profile = get_professional_profile(
        current_user=current_user,
    )

    professional_service = get_professional_service(
        db=db,
        professional_service_id=professional_service_id,
        professional_profile_id=profile.id,
    )

    if professional_service is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Professional service not found",
        )

    professional_service = update_professional_service(
        db=db,
        professional_service=professional_service,
        update_data=request.model_dump(exclude_unset=True),
    )

    db.commit()
    db.refresh(professional_service)

    return professional_service


@router.delete(
    "/services/{professional_service_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def remove_my_service(
    professional_service_id: int,
    current_user: User = Depends(require_role("PROFESSIONAL")),
    db: Session = Depends(get_db),
):
    profile = get_professional_profile(
        current_user=current_user,
    )

    professional_service = get_professional_service(
        db=db,
        professional_service_id=professional_service_id,
        professional_profile_id=profile.id,
    )

    if professional_service is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Professional service not found",
        )

    delete_professional_service(
        db=db,
        professional_service=professional_service,
    )

    db.commit()