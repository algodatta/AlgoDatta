
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import SessionLocal, Base, engine
from app.models.user import User
from app.schemas.auth import LoginRequest, Token
from app.core.security import hash_password, verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["auth"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_admin(db: Session):
    # idempotent create of admin
    admin_email = "admin@algodatta.com"
    admin_pass = "ChangeMe123!"
    if not db.query(User).filter(User.email == admin_email).first():
        u = User(email=admin_email, password_hash=hash_password(admin_pass), role="admin")
        db.add(u); db.commit()

@router.on_event("startup")
def _startup():
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as db:
        init_admin(db)

@router.post("/login", response_model=Token, responses={401: {"description":"Invalid credentials"}})
def login(data: LoginRequest, db: Session = Depends(get_db)):
    u = db.query(User).filter(User.email == data.email).first()
    if not u or not verify_password(data.password, u.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
    tok = create_access_token(str(u.id), u.role)
    return Token(access_token=tok)
