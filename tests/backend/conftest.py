import os
import sys
import pytest

# Dynamically resolve project root
root_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
sys.path.insert(0, root_path)

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.app.main import app
from backend.app.core.database import Base, get_db
from backend.app.core.config import settings
from backend.app.models.database import Incident, AuditLog, Announcement

# Use a temporary file-based SQLite database for testing
TEST_DATABASE_URL = "sqlite:///./test_stadiumops.db"

engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Dependency override
def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

@pytest.fixture(scope="function", autouse=True)
def setup_db():
    """
    Creates tables before each test and drops them after.
    """
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="module")
def client():
    # Apply database override
    app.dependency_overrides[get_db] = override_get_db
    # Set testing flags
    settings.ENVIRONMENT = "development"
    # Create client
    with TestClient(app) as c:
        yield c
    # Clean overrides
    app.dependency_overrides.clear()
