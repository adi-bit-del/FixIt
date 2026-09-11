from app.core.database import SessionLocal
from app.models import Role


REQUIRED_ROLES = (
    "CUSTOMER",
    "PROFESSIONAL",
    "ADMIN",
)


db = SessionLocal()

try:
    for role_name in REQUIRED_ROLES:
        role = db.query(Role).filter(
            Role.name == role_name
        ).first()

        if role is None:
            db.add(
                Role(
                    name=role_name,
                )
            )
            print(f"Created role: {role_name}")
        else:
            print(f"Role already exists: {role_name}")

    db.commit()

    print("Role seed completed successfully.")

except Exception:
    db.rollback()
    raise

finally:
    db.close()