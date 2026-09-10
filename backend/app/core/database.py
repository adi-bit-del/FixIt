from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.core.config import settings


def get_database_url(url: str) -> str:
    """
    Normalize PostgreSQL URLs to explicitly use psycopg 3.

    Render may provide:
        postgres://...
        postgresql://...

    The application uses:
        postgresql+psycopg://...
    """
    if url.startswith("postgres://"):
        return "postgresql+psycopg://" + url[len("postgres://"):]

    if url.startswith("postgresql://"):
        return "postgresql+psycopg://" + url[len("postgresql://"):]

    return url


database_url = get_database_url(
    settings.database_url
)


engine = create_engine(
    database_url,
    echo=False,
)


SessionLocal = sessionmaker(
    bind=engine,
    autoflush=False,
    autocommit=False,
)


class Base(DeclarativeBase):
    pass


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()