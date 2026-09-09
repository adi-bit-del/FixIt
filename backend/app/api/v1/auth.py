from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.core.security import create_access_token
from app.models import User
from app.schemas.auth import (
    ForgotPasswordRequest,
    ForgotPasswordResponse,
    LoginRequest,
    LoginResponse,
    RegisterRequest,
    ResetPasswordRequest,
    UserResponse,
)
from app.services.password_reset import (
    create_password_reset_token,
    reset_password,
)
from app.services.user_service import (
    authenticate_user,
    create_user,
)

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
def register(
    payload: RegisterRequest,
    db: Session = Depends(get_db),
):
    existing_user = db.scalar(
        select(User).where(User.email == payload.email)
    )

    if existing_user is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists.",
        )

    user = create_user(
        db=db,
        email=payload.email,
        password=payload.password,
        role=payload.role,
    )

    db.commit()
    db.refresh(user)

    return UserResponse.from_user(user)


@router.post(
    "/login",
    response_model=LoginResponse,
)
def login(
    payload: LoginRequest,
    db: Session = Depends(get_db),
):
    user = authenticate_user(
        db=db,
        email=payload.email,
        password=payload.password,
    )

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account is inactive.",
        )

    access_token = create_access_token(user.id)

    return LoginResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.from_user(user),
    )


@router.get(
    "/me",
    response_model=UserResponse,
)
def get_me(
    current_user: User = Depends(get_current_user),
):
    return UserResponse.from_user(current_user)


@router.post(
    "/forgot-password",
    response_model=ForgotPasswordResponse,
)
def forgot_password(
    payload: ForgotPasswordRequest,
    db: Session = Depends(get_db),
):
    user = db.scalar(
        select(User).where(User.email == payload.email)
    )

    generic_message = (
        "If an account exists for this email, "
        "a password reset link has been generated."
    )

    # Do not reveal whether the email is registered.
    if user is None or not user.is_active:
        return ForgotPasswordResponse(
            message=generic_message,
        )

    reset_token = create_password_reset_token(
        db=db,
        user=user,
    )

    db.commit()

    reset_url = (
        f"{settings.frontend_base_url}"
        f"/reset-password?token={reset_token}"
    )

    return ForgotPasswordResponse(
        message="Password reset link generated successfully.",
        reset_token=reset_token,
        reset_url=reset_url,
    )


@router.post(
    "/reset-password",
)
def reset_user_password(
    payload: ResetPasswordRequest,
    db: Session = Depends(get_db),
):
    try:
        reset_password(
            db=db,
            raw_token=payload.token,
            new_password=payload.new_password,
        )

        db.commit()

        return {
            "message": "Password has been reset successfully."
        }

    except ValueError as exc:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc