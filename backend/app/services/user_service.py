from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.password import hash_password, verify_password
from app.models import (
    CustomerProfile,
    ProfessionalProfile,
    Role,
    User,
)


PUBLIC_REGISTRATION_ROLES = {"CUSTOMER", "PROFESSIONAL"}


def authenticate_user(
    db: Session,
    email: str,
    password: str,
) -> User:
    user = db.scalar(
        select(User).where(User.email == email)
    )

    if user is None:
        raise ValueError("Invalid email or password")

    if not verify_password(password, user.password_hash):
        raise ValueError("Invalid email or password")

    if not user.is_active:
        raise ValueError("User account is inactive")

    return user


def create_user(
    db: Session,
    email: str,
    password: str,
    role_name: str,
) -> User:
    existing_user = db.scalar(
        select(User).where(User.email == email)
    )

    if existing_user:
        raise ValueError("Email is already registered")

    role_name = role_name.upper()

    if role_name not in PUBLIC_REGISTRATION_ROLES:
        raise ValueError("Invalid registration role")

    role = db.scalar(
        select(Role).where(Role.name == role_name)
    )

    if role is None:
        raise ValueError(f"{role_name} role does not exist")

    user = User(
        email=email,
        password_hash=hash_password(password),
    )

    user.roles.append(role)

    db.add(user)
    db.flush()

    if role_name == "CUSTOMER":
        customer_profile = CustomerProfile(
            user_id=user.id,
        )

        db.add(customer_profile)

    elif role_name == "PROFESSIONAL":
        professional_profile = ProfessionalProfile(
            user_id=user.id,
            business_name=email.split("@")[0],
        )

        db.add(professional_profile)

    db.flush()

    return user