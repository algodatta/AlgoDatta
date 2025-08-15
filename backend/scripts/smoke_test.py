"""Run a database smoke test for Phase 1.
- Connects to DB, creates a temp user, queries it back, and cleans up.
- Prints PASS/FAIL at the end.
"""
import os, uuid, sys
from dotenv import load_dotenv
from sqlalchemy import select, delete
from app.db.session import SessionLocal, engine
from app.db.base import Base
from app.models import User, UserRole

def main():
    load_dotenv()
    try:
        Base.metadata.create_all(bind=engine)
        email = f"smoke_{uuid.uuid4()}@algodatta.test"
        with SessionLocal() as db:
            u = User(email=email, password_hash="x", role=UserRole.user)
            db.add(u)
            db.commit()
            uid = u.id

            found = db.execute(select(User).where(User.id == uid)).scalar_one_or_none()
            assert found and found.email == email, "Inserted user not found"

            db.execute(delete(User).where(User.id == uid))
            db.commit()

        print("PHASE-1 SMOKE TEST: PASS")
        return 0
    except Exception as e:
        print("PHASE-1 SMOKE TEST: FAIL")
        print(e)
        return 1

if __name__ == "__main__":
    sys.exit(main())
