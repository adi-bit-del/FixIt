from datetime import datetime, timedelta, timezone
import hashlib
import secrets

from sqlalchemy import delete, select, update
from sqlalchemy.orm import Session

from app.core.password import hash_password
from app.models import PasswordResetToken, User


RESET_TOKEN_EXPIRE_MINUTES = 30


def _hash_reset_token(token: str) -> str:
    return hashlib.sha256(
        token.encode("utf-8")
    ).hexdigest()


def create_password_reset_token(
    db: Session,
    user: User,
) -> str:
    # Invalidate any previous unused reset tokens.
    db.execute(
        delete(PasswordResetToken).where(
            PasswordResetToken.user_id == user.id,
            PasswordResetToken.used_at.is_(None),
        )
    )

    raw_token = secrets.token_urlsafe(48)

    token_hash = _hash_reset_token(raw_token)

    expires_at = (
        datetime.now(timezone.utc)
        + timedelta(
            minutes=RESET_TOKEN_EXPIRE_MINUTES
        )
    )

    reset_token = PasswordResetToken(
        user_id=user.id,
        token_hash=token_hash,
        expires_at=expires_at,
    )

    db.add(reset_token)
    db.flush()

    return raw_token


def reset_password(
    db: Session,
    raw_token: str,
    new_password: str,
) -> None:
    token_hash = _hash_reset_token(raw_token)
    now = datetime.now(timezone.utc)

    reset_token = db.scalar(
        select(PasswordResetToken).where(
            PasswordResetToken.token_hash == token_hash,
        )
    )

    if reset_token is None:
        raise ValueError(
            "Invalid or expired password reset token"
        )

    if reset_token.used_at is not None:
        raise ValueError(
            "This password reset token has already been used"
        )

    if reset_token.expires_at <= now:
        raise ValueError(
            "Invalid or expired password reset token"
        )

    user = db.get(
        User,
        reset_token.user_id,
    )

    if user is None:
        raise ValueError(
            "User account not found"
        )

    # Atomically consume the token. If another request has already
    # consumed it, this update affects zero rows.
    result = db.execute(
        update(PasswordResetToken)
        .where(
            PasswordResetToken.id == reset_token.id,
            PasswordResetToken.used_at.is_(None),
            PasswordResetToken.expires_at > now,
        )
        .values(used_at=now)
    )

    if result.rowcount != 1:
        raise ValueError(
            "This password reset token has already been used"
        )

    user.password_hash = hash_password(new_password)

    db.flush()