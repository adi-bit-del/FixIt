from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Notification


def create_notification(
    db: Session,
    user_id: int,
    notification_type: str,
    title: str,
    message: str,
) -> Notification:
    notification = Notification(
        user_id=user_id,
        type=notification_type,
        title=title,
        message=message,
    )

    db.add(notification)
    db.flush()

    return notification


def get_user_notifications(
    db: Session,
    user_id: int,
    unread_only: bool = False,
) -> list[Notification]:
    query = select(Notification).where(
        Notification.user_id == user_id
    )

    if unread_only:
        query = query.where(
            Notification.is_read.is_(False)
        )

    query = query.order_by(
        Notification.created_at.desc()
    )

    return list(db.scalars(query).all())


def get_notification(
    db: Session,
    notification_id: int,
    user_id: int,
) -> Notification | None:
    return db.scalar(
        select(Notification).where(
            Notification.id == notification_id,
            Notification.user_id == user_id,
        )
    )


def mark_notification_as_read(
    db: Session,
    notification: Notification,
) -> Notification:
    notification.is_read = True
    notification.read_at = datetime.now(timezone.utc)

    db.flush()

    return notification


def mark_all_notifications_as_read(
    db: Session,
    user_id: int,
) -> int:
    notifications = list(
        db.scalars(
            select(Notification).where(
                Notification.user_id == user_id,
                Notification.is_read.is_(False),
            )
        ).all()
    )

    read_at = datetime.now(timezone.utc)

    for notification in notifications:
        notification.is_read = True
        notification.read_at = read_at

    db.flush()

    return len(notifications)