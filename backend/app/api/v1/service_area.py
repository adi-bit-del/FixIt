from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import require_role
from app.models import ProfessionalProfile, User
from app.schemas.service_area import (
    ServiceAreaCreate,
    ServiceAreaResponse,
    ServiceAreaUpdate,
)
from app.services.service_area import (
    create_service_area,
    delete_service_area,
    get_service_area,
    get_service_areas,
    update_service_area,
)


router = APIRouter(
    prefix="/professional/service-areas",
    tags=["Professional Service Areas"],
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


@router.get(
    "",
    response_model=list[ServiceAreaResponse],
)
def list_my_service_areas(
    current_user: User = Depends(require_role("PROFESSIONAL")),
    db: Session = Depends(get_db),
):
    profile = get_professional_profile(current_user)

    return get_service_areas(
        db=db,
        professional_profile_id=profile.id,
    )


@router.post(
    "",
    response_model=ServiceAreaResponse,
    status_code=status.HTTP_201_CREATED,
)
def add_service_area(
    request: ServiceAreaCreate,
    current_user: User = Depends(require_role("PROFESSIONAL")),
    db: Session = Depends(get_db),
):
    profile = get_professional_profile(current_user)

    area = create_service_area(
        db=db,
        professional_profile_id=profile.id,
        city=request.city,
        state=request.state,
        postal_code=request.postal_code,
        latitude=request.latitude,
        longitude=request.longitude,
        radius_km=request.radius_km,
    )

    db.commit()
    db.refresh(area)

    return area


@router.patch(
    "/{service_area_id}",
    response_model=ServiceAreaResponse,
)
def update_my_service_area(
    service_area_id: int,
    request: ServiceAreaUpdate,
    current_user: User = Depends(require_role("PROFESSIONAL")),
    db: Session = Depends(get_db),
):
    profile = get_professional_profile(current_user)

    area = get_service_area(
        db=db,
        service_area_id=service_area_id,
        professional_profile_id=profile.id,
    )

    if area is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service area not found",
        )

    area = update_service_area(
        db=db,
        service_area=area,
        update_data=request.model_dump(exclude_unset=True),
    )

    db.commit()
    db.refresh(area)

    return area


@router.delete(
    "/{service_area_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def remove_service_area(
    service_area_id: int,
    current_user: User = Depends(require_role("PROFESSIONAL")),
    db: Session = Depends(get_db),
):
    profile = get_professional_profile(current_user)

    area = get_service_area(
        db=db,
        service_area_id=service_area_id,
        professional_profile_id=profile.id,
    )

    if area is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service area not found",
        )

    delete_service_area(
        db=db,
        service_area=area,
    )

    db.commit()