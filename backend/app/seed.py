from app.db.session import SessionLocal, Base, engine
from app.models.user import User
from app.core.security import get_password_hash

def main():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    if not db.query(User).filter(User.email=="admin@example.com").first():
        u = User(email="admin@example.com", password_hash=get_password_hash("admin"))
        db.add(u); db.commit()
        print("Seeded admin@example.com / admin")
    else:
        print("Admin user already exists")
    db.close()

if __name__ == "__main__":
    main()
