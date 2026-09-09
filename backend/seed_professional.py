from app.core.database import SessionLocal
from app.core.password import hash_password
from app.models import ProfessionalProfile, Role, User


PROFESSIONAL_EMAIL = "professional@fixit.com"
PROFESSIONAL_PASSWORD = "FixIt@12345"


db = SessionLocal()

try:
    user = db.query(User).filter(
        User.email == PROFESSIONAL_EMAIL
    ).first()

    if user is None:
        user = User(
            email=PROFESSIONAL_EMAIL,
            password_hash=hash_password(PROFESSIONAL_PASSWORD),
        )
        db.add(user)
        db.flush()

    professional_role = db.query(Role).filter(
        Role.name == "PROFESSIONAL"
    ).first()

    if professional_role is None:
        raise ValueError("PROFESSIONAL role does not exist")

    if professional_role not in user.roles:
        user.roles.append(professional_role)

    profile = db.query(ProfessionalProfile).filter(
        ProfessionalProfile.user_id == user.id
    ).first()

    if profile is None:
        profile = ProfessionalProfile(
            user_id=user.id,
            business_name="FixIt Demo Professional",
            bio="Development professional account for FixIt testing.",
            experience_years=5,
            phone="9876543210",
            verification_status="VERIFIED",
        )
        db.add(profile)

    db.commit()

    print("Professional account ready")
    print("Email:", PROFESSIONAL_EMAIL)
    print("Password:", PROFESSIONAL_PASSWORD)
    print("User ID:", user.id)
    print("Business:", profile.business_name)

except Exception:
    db.rollback()
    raise

finally:
    db.close()