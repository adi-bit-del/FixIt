from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models import User
from app.schemas.notification import (
    NotificationReadResponse,
    NotificationResponse,
)
from app.services.notification import (
    get_notification,
    get_user_notifications,
    mark_all_notifications_as_read,
    mark_notification_as_read,
)


router = APIRouter(
    prefix="/notifications",
    tags=["Notifications"],
)


@router.get(
    "",
    response_model=list[NotificationResponse],
)
def list_notifications(
    unread_only: bool = False,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return get_user_notifications(
        db=db,
        user_id=current_user.id,
        unread_only=unread_only,
    )


@router.patch(
    "/{notification_id}/read",
    response_model=NotificationResponse,
)
def read_notification(
    notification_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    notification = get_notification(
        db=db,
        notification_id=notification_id,
        user_id=current_user.id,
    )

    if notification is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found",
        )

    notification = mark_notification_as_read(
        db=db,
        notification=notification,
    )

    db.commit()
    db.refresh(notification)

    return notification


@router.patch(
    "/read-all",
    response_model=NotificationReadResponse,
)
def read_all_notifications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    count = mark_all_notifications_as_read(
        db=db,
        user_id=current_user.id,
    )

    db.commit()

    return {
        "message": f"{count} notifications marked as read"
    }