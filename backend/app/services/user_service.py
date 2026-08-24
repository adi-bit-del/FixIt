from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.password import hash_password, verify_password
from app.models import Role, User



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
) -> User:
    existing_user = db.scalar(
        select(User).where(User.email == email)
    )

    if existing_user:
        raise ValueError("Email is already registered")

    customer_role = db.scalar(
        select(Role).where(Role.name == "CUSTOMER")
    )

    if customer_role is None:
        raise ValueError("CUSTOMER role does not exist")

    user = User(
        email=email,
        password_hash=hash_password(password),
    )

    user.roles.append(customer_role)

    db.add(user)
    db.flush()

    return user