"""add review moderation status

Revision ID: 5b0715f27597
Revises: 5dbeeb704707
Create Date: 2026-09-05 19:39:09.778473

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "5b0715f27597"
down_revision: Union[str, Sequence[str], None] = "5dbeeb704707"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "reviews",
        sa.Column(
            "moderation_status",
            sa.String(length=20),
            nullable=False,
            server_default="VISIBLE",
        ),
    )


def downgrade() -> None:
    op.drop_column(
        "reviews",
        "moderation_status",
    )