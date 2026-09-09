from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.discovery import ProfessionalDiscoveryResponse
from app.services.discovery_service import discover_professionals


router = APIRouter(
    prefix="/professionals",
    tags=["Professional Discovery"],
)


@router.get(
    "",
    response_model=list[ProfessionalDiscoveryResponse],
)
def discover(
    service_id: int | None = None,
    city: str | None = None,
    postal_code: str | None = None,
    db: Session = Depends(get_db),
):
    return discover_professionals(
        db=db,
        service_id=service_id,
        city=city,
        postal_code=postal_code,
    )