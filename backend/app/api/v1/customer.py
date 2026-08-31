from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import require_role
from app.models import User
from app.schemas.customer import (
    CustomerProfileCreate,
    CustomerProfileResponse,
    CustomerProfileUpdate,
)
from app.services.customer_service import (
    create_customer_profile,
    get_customer_profile,
    update_customer_profile,
)


router = APIRouter(
    prefix="/customer",
    tags=["Customer"],
)


@router.get(
    "/profile",
    response_model=CustomerProfileResponse,
)
def get_profile(
    current_user: User = Depends(require_role("CUSTOMER")),
    db: Session = Depends(get_db),
):
    profile = get_customer_profile(
        db=db,
        user_id=current_user.id,
    )

    if profile is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer profile not found",
        )

    return profile


@router.post(
    "/profile",
    response_model=CustomerProfileResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_profile(
    request: CustomerProfileCreate,
    current_user: User = Depends(require_role("CUSTOMER")),
    db: Session = Depends(get_db),
):
    try:
        profile = create_customer_profile(
            db=db,
            user_id=current_user.id,
            first_name=request.first_name,
            last_name=request.last_name,
            phone=request.phone,
            profile_image_url=request.profile_image_url,
        )

        db.commit()
        db.refresh(profile)

        return profile

    except ValueError as error:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error),
        )


@router.patch(
    "/profile",
    response_model=CustomerProfileResponse,
)
def update_profile(
    request: CustomerProfileUpdate,
    current_user: User = Depends(require_role("CUSTOMER")),
    db: Session = Depends(get_db),
):
    profile = get_customer_profile(
        db=db,
        user_id=current_user.id,
    )

    if profile is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer profile not found",
        )

    update_data = request.model_dump(exclude_unset=True)

    profile = update_customer_profile(
        db=db,
        profile=profile,
        update_data=update_data,
    )

    db.commit()
    db.refresh(profile)

    return profile