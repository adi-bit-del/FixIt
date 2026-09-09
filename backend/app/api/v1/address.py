from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import require_role
from app.models import User
from app.schemas.address import (
    AddressCreate,
    AddressResponse,
    AddressUpdate,
)
from app.services.address_service import (
    create_address,
    delete_address,
    get_address,
    get_customer_addresses,
    update_address,
)
from app.services.customer_service import get_customer_profile


router = APIRouter(
    prefix="/customer/addresses",
    tags=["Customer Addresses"],
)


@router.get(
    "",
    response_model=list[AddressResponse],
)
def list_addresses(
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

    return get_customer_addresses(
        db=db,
        customer_profile_id=profile.id,
    )


@router.post(
    "",
    response_model=AddressResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_customer_address(
    request: AddressCreate,
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

    try:
        address = create_address(
            db=db,
            customer_profile_id=profile.id,
            label=request.label,
            address_line_1=request.address_line_1,
            address_line_2=request.address_line_2,
            landmark=request.landmark,
            city=request.city,
            state=request.state,
            postal_code=request.postal_code,
            latitude=request.latitude,
            longitude=request.longitude,
            is_default=request.is_default,
        )

        db.commit()
        db.refresh(address)

        return address

    except Exception:
        db.rollback()
        raise


@router.patch(
    "/{address_id}",
    response_model=AddressResponse,
)
def update_customer_address(
    address_id: int,
    request: AddressUpdate,
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

    address = get_address(
        db=db,
        address_id=address_id,
        customer_profile_id=profile.id,
    )

    if address is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Address not found",
        )

    update_data = request.model_dump(exclude_unset=True)

    address = update_address(
        db=db,
        address=address,
        update_data=update_data,
    )

    db.commit()
    db.refresh(address)

    return address


@router.delete(
    "/{address_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_customer_address(
    address_id: int,
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

    address = get_address(
        db=db,
        address_id=address_id,
        customer_profile_id=profile.id,
    )

    if address is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Address not found",
        )

    delete_address(
        db=db,
        address=address,
    )

    db.commit()