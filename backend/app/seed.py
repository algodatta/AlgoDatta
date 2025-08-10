from app.db.session import SessionLocal, Base, engine
from app.models.user import User
from app.core.security import get_password_hash

def main():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        u = db.query(User).filter(User.email=='admin@example.com').first()
        if not u:
            u = User(email='admin@example.com', password_hash=get_password_hash('Admin@123'), email_verified=True)
            db.add(u); db.commit()
            print('Seeded admin@example.com / Admin@123 (verified)')
        else:
            print('Admin user already exists')
    finally:
        db.close()

if __name__ == '__main__':
    main()
