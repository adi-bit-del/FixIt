from uuid import uuid4

from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def create_test_user(role: str) -> tuple[str, str]:
    email = f"pytest_{role.lower()}_{uuid4().hex[:8]}@fixit.com"
    password = "Test@12345"

    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": email,
            "password": password,
            "role": role,
        },
    )

    assert response.status_code == 201, response.text

    return email, password


def get_access_token(email: str, password: str) -> str:
    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": email,
            "password": password,
        },
    )

    assert response.status_code == 200, response.text

    return response.json()["access_token"]


def test_register_customer():
    email, password = create_test_user("CUSTOMER")

    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": email,
            "password": password,
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert "access_token" in data
    assert data["token_type"].lower() == "bearer"
    assert data["user"]["email"] == email
    assert "CUSTOMER" in data["user"]["roles"]


def test_register_professional():
    email, password = create_test_user("PROFESSIONAL")

    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": email,
            "password": password,
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert "access_token" in data
    assert data["token_type"].lower() == "bearer"
    assert data["user"]["email"] == email
    assert "PROFESSIONAL" in data["user"]["roles"]


def test_register_duplicate_email():
    email, password = create_test_user("CUSTOMER")

    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": email,
            "password": password,
            "role": "CUSTOMER",
        },
    )

    assert response.status_code == 409


def test_login_invalid_password_returns_401():
    email, _ = create_test_user("CUSTOMER")

    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": email,
            "password": "WrongPassword@123",
        },
    )

    assert response.status_code == 401

    data = response.json()
    assert data["detail"] == "Invalid email or password."


def test_auth_me_requires_token():
    response = client.get(
        "/api/v1/auth/me",
    )

    assert response.status_code == 401


def test_auth_me_returns_current_user():
    email, password = create_test_user("CUSTOMER")

    token = get_access_token(
        email,
        password,
    )

    response = client.get(
        "/api/v1/auth/me",
        headers={
            "Authorization": f"Bearer {token}",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["email"] == email
    assert data["is_active"] is True
    assert "CUSTOMER" in data["roles"]


def test_customer_cannot_access_professional_services():
    email, password = create_test_user("CUSTOMER")

    token = get_access_token(
        email,
        password,
    )

    response = client.get(
        "/api/v1/professional/services",
        headers={
            "Authorization": f"Bearer {token}",
        },
    )

    assert response.status_code == 403


def test_professional_can_access_professional_services():
    email, password = create_test_user("PROFESSIONAL")

    token = get_access_token(
        email,
        password,
    )

    response = client.get(
        "/api/v1/professional/services",
        headers={
            "Authorization": f"Bearer {token}",
        },
    )

    assert response.status_code == 200


def test_professional_cannot_access_admin_professionals():
    email, password = create_test_user("PROFESSIONAL")

    token = get_access_token(
        email,
        password,
    )

    response = client.get(
        "/api/v1/admin/professionals",
        headers={
            "Authorization": f"Bearer {token}",
        },
    )

    assert response.status_code == 403


def test_customer_cannot_access_admin_professionals():
    email, password = create_test_user("CUSTOMER")

    token = get_access_token(
        email,
        password,
    )

    response = client.get(
        "/api/v1/admin/professionals",
        headers={
            "Authorization": f"Bearer {token}",
        },
    )

    assert response.status_code == 403


def test_admin_can_access_admin_professionals():
    token = get_access_token(
        "admin@fixit.com",
        "FixIt@12345",
    )

    response = client.get(
        "/api/v1/admin/professionals",
        headers={
            "Authorization": f"Bearer {token}",
        },
    )

    assert response.status_code == 200