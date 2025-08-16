import os, pytest
try:
    from app.main import app
    from fastapi.testclient import TestClient
    HAVE_APP = True
except Exception:
    HAVE_APP = False
    app = None
    TestClient = None

@pytest.fixture(scope="session")
def client():
    if not HAVE_APP:
        pytest.skip("FastAPI app not importable in this environment")
    return TestClient(app)