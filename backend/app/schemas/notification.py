from datetime import datetime

from pydantic import BaseModel


class NotificationResponse(BaseModel):
    id: int
    user_id: int
    type: str
    title: str
    message: str
    is_read: bool
    read_at: datetime | None
    created_at: datetime

    model_config = {
        "from_attributes": True,
    }


class NotificationReadResponse(BaseModel):
    message: str