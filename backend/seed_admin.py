from app.core.database import SessionLocal
from app.core.password import hash_password
from app.models import Role, User


ADMIN_EMAIL = "admin@fixit.com"
ADMIN_PASSWORD = "FixIt@12345"


db = SessionLocal()

try:
    user = db.query(User).filter(
        User.email == ADMIN_EMAIL
    ).first()

    if user is None:
        user = User(
            email=ADMIN_EMAIL,
            password_hash=hash_password(ADMIN_PASSWORD),
        )
        db.add(user)
        db.flush()

    admin_role = db.query(Role).filter(
        Role.name == "ADMIN"
    ).first()

    if admin_role is None:
        raise ValueError("ADMIN role does not exist")

    if admin_role not in user.roles:
        user.roles.append(admin_role)

    db.commit()

    print("Admin account ready")
    print("Email:", ADMIN_EMAIL)
    print("Password:", ADMIN_PASSWORD)
    print("User ID:", user.id)

except Exception:
    db.rollback()
    raise

finally:
    db.close()