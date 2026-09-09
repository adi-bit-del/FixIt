from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def get_access_token(email: str, password: str) -> str:
    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": email,
            "password": password,
        },
    )

    assert response.status_code == 200

    return response.json()["access_token"]


def test_register_customer():
    email = "pytest_customer@fixit.com"

    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": email,
            "password": "Test@12345",
        },
    )

    assert response.status_code in (201, 400)

    if response.status_code == 201:
        data = response.json()
        assert data["email"] == email


def test_login_existing_customer():
    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": "adi@fixit.com",
            "password": "FixIt@12345",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert "access_token" in data
    assert data["token_type"].lower() == "bearer"


def test_auth_me_requires_token():
    response = client.get(
        "/api/v1/auth/me",
    )

    assert response.status_code == 401


def test_customer_cannot_access_professional_services():
    token = get_access_token(
        "adi@fixit.com",
        "FixIt@12345",
    )

    response = client.get(
        "/api/v1/professional/services",
        headers={
            "Authorization": f"Bearer {token}",
        },
    )

    assert response.status_code == 403


def test_professional_can_access_professional_services():
    token = get_access_token(
        "professional@fixit.com",
        "FixIt@12345",
    )

    response = client.get(
        "/api/v1/professional/services",
        headers={
            "Authorization": f"Bearer {token}",
        },
    )

    assert response.status_code == 200


def test_professional_cannot_access_admin_professionals():
    token = get_access_token(
        "professional@fixit.com",
        "FixIt@12345",
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