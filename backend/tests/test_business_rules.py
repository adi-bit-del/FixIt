from types import SimpleNamespace
from unittest.mock import MagicMock

import pytest

from app.services.booking import (
    cancel_booking,
    complete_booking,
    mark_booking_in_progress,
)
from app.services.quote import accept_quote, reject_quote
from app.services.review import create_review


def test_quote_can_be_accepted_only_when_pending():
    db = MagicMock()

    quote = SimpleNamespace(
        status="PENDING",
        expires_at=None,
    )

    result = accept_quote(
        db=db,
        quote=quote,
    )

    assert result.status == "ACCEPTED"
    db.flush.assert_called_once()


def test_accepted_quote_cannot_be_accepted_again():
    db = MagicMock()

    quote = SimpleNamespace(
        status="ACCEPTED",
        expires_at=None,
    )

    with pytest.raises(
        ValueError,
        match="Only pending quotes can be accepted",
    ):
        accept_quote(
            db=db,
            quote=quote,
        )


def test_pending_quote_can_be_rejected():
    db = MagicMock()

    quote = SimpleNamespace(
        status="PENDING",
    )

    result = reject_quote(
        db=db,
        quote=quote,
    )

    assert result.status == "REJECTED"
    db.flush.assert_called_once()


def test_completed_booking_cannot_be_started():
    db = MagicMock()

    booking = SimpleNamespace(
        status="COMPLETED",
        id=2,
    )

    with pytest.raises(
        ValueError,
        match="Only confirmed bookings can start",
    ):
        mark_booking_in_progress(
            db=db,
            booking=booking,
        )


def test_booking_requires_successful_payment_before_start():
    db = MagicMock()
    db.scalar.return_value = None

    booking = SimpleNamespace(
        status="CONFIRMED",
        id=999,
    )

    with pytest.raises(
        ValueError,
        match="Booking cannot start until payment is successful",
    ):
        mark_booking_in_progress(
            db=db,
            booking=booking,
        )


def test_booking_can_start_after_successful_payment():
    db = MagicMock()

    db.scalar.return_value = SimpleNamespace(
        booking_id=2,
        status="SUCCESS",
    )

    booking = SimpleNamespace(
        status="CONFIRMED",
        id=2,
    )

    result = mark_booking_in_progress(
        db=db,
        booking=booking,
    )

    assert result.status == "IN_PROGRESS"
    db.flush.assert_called_once()


def test_confirmed_booking_can_be_cancelled():
    db = MagicMock()

    booking = SimpleNamespace(
        status="CONFIRMED",
    )

    result = cancel_booking(
        db=db,
        booking=booking,
    )

    assert result.status == "CANCELLED"
    db.flush.assert_called_once()


def test_only_in_progress_booking_can_be_completed():
    db = MagicMock()

    booking = SimpleNamespace(
        status="CONFIRMED",
    )

    with pytest.raises(
        ValueError,
        match="Only in-progress bookings can be completed",
    ):
        complete_booking(
            db=db,
            booking=booking,
        )


def test_review_requires_completed_booking():
    db = MagicMock()

    booking = SimpleNamespace(
        id=2,
        customer_profile_id=1,
        professional_profile_id=1,
        status="CONFIRMED",
    )

    with pytest.raises(
        ValueError,
        match="Only completed bookings can be reviewed",
    ):
        create_review(
            db=db,
            booking=booking,
            customer_profile_id=1,
            rating=5,
            comment="Great service",
        )


def test_review_can_be_created_for_completed_booking():
    db = MagicMock()

    db.scalar.return_value = None

    booking = SimpleNamespace(
        id=2,
        customer_profile_id=1,
        professional_profile_id=1,
        status="COMPLETED",
    )

    review = create_review(
        db=db,
        booking=booking,
        customer_profile_id=1,
        rating=5,
        comment="Great service",
    )

    assert review.booking_id == 2
    assert review.customer_profile_id == 1
    assert review.professional_profile_id == 1
    assert review.rating == 5
    assert review.comment == "Great service"

    db.add.assert_called_once()
    db.flush.assert_called_once()


def test_duplicate_review_is_rejected():
    db = MagicMock()

    db.scalar.return_value = SimpleNamespace(
        id=1,
        booking_id=2,
    )

    booking = SimpleNamespace(
        id=2,
        customer_profile_id=1,
        professional_profile_id=1,
        status="COMPLETED",
    )

    with pytest.raises(
        ValueError,
        match="A review already exists for this booking",
    ):
        create_review(
            db=db,
            booking=booking,
            customer_profile_id=1,
            rating=5,
            comment="Great service",
        )