from typing import Literal

from pydantic import BaseModel, Field


VerificationStatus = Literal["PENDING", "VERIFIED", "REJECTED"]


class ProfessionalProfileResponse(BaseModel):
    id: int
    user_id: int
    business_name: str
    bio: str | None
    experience_years: int
    phone: str | None
    profile_image_url: str | None
    verification_status: VerificationStatus

    model_config = {
        "from_attributes": True,
    }


class ProfessionalVerificationUpdate(BaseModel):
    verification_status: Literal["VERIFIED", "REJECTED"]