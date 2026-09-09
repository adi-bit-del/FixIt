from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import require_role
from app.models import User
from app.schemas.category import (
    CategoryCreate,
    CategoryResponse,
    CategoryUpdate,
)
from app.schemas.service import (
    ServiceCreate,
    ServiceResponse,
    ServiceUpdate,
)
from app.services.category_service import (
    create_category,
    get_categories,
    get_category,
    update_category,
)
from app.services.service_service import (
    create_service,
    get_service,
    get_services,
    update_service,
)


router = APIRouter(
    prefix="/services",
    tags=["Service Catalog"],
)

admin_router = APIRouter(
    prefix="/admin/services",
    tags=["Admin - Service Catalog"],
)


@router.get(
    "/categories",
    response_model=list[CategoryResponse],
)
def list_categories(
    db: Session = Depends(get_db),
):
    return get_categories(db=db)


@router.get(
    "",
    response_model=list[ServiceResponse],
)
def list_service_catalog(
    category_id: int | None = None,
    db: Session = Depends(get_db),
):
    return get_services(
        db=db,
        category_id=category_id,
    )


@router.get(
    "/{service_id}",
    response_model=ServiceResponse,
)
def get_service_details(
    service_id: int,
    db: Session = Depends(get_db),
):
    service = get_service(
        db=db,
        service_id=service_id,
    )

    if service is None or not service.is_active:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service not found",
        )

    return service


@admin_router.post(
    "/categories",
    response_model=CategoryResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_service_category(
    request: CategoryCreate,
    current_user: User = Depends(require_role("ADMIN")),
    db: Session = Depends(get_db),
):
    try:
        category = create_category(
            db=db,
            name=request.name,
            description=request.description,
        )

        db.commit()
        db.refresh(category)

        return category

    except ValueError as error:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error),
        )


@admin_router.patch(
    "/categories/{category_id}",
    response_model=CategoryResponse,
)
def update_service_category(
    category_id: int,
    request: CategoryUpdate,
    current_user: User = Depends(require_role("ADMIN")),
    db: Session = Depends(get_db),
):
    category = get_category(
        db=db,
        category_id=category_id,
    )

    if category is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found",
        )

    update_data = request.model_dump(exclude_unset=True)

    try:
        category = update_category(
            db=db,
            category=category,
            update_data=update_data,
        )

        db.commit()
        db.refresh(category)

        return category

    except ValueError as error:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error),
        )


@admin_router.post(
    "",
    response_model=ServiceResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_catalog_service(
    request: ServiceCreate,
    current_user: User = Depends(require_role("ADMIN")),
    db: Session = Depends(get_db),
):
    try:
        service = create_service(
            db=db,
            category_id=request.category_id,
            name=request.name,
            description=request.description,
            base_price=request.base_price,
        )

        db.commit()
        db.refresh(service)

        return service

    except ValueError as error:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error),
        )


@admin_router.patch(
    "/{service_id}",
    response_model=ServiceResponse,
)
def update_catalog_service(
    service_id: int,
    request: ServiceUpdate,
    current_user: User = Depends(require_role("ADMIN")),
    db: Session = Depends(get_db),
):
    service = get_service(
        db=db,
        service_id=service_id,
    )

    if service is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service not found",
        )

    update_data = request.model_dump(exclude_unset=True)

    try:
        service = update_service(
            db=db,
            service=service,
            update_data=update_data,
        )

        db.commit()
        db.refresh(service)

        return service

    except ValueError as error:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error),
        )