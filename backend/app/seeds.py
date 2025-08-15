import uuid
from passlib.context import CryptContext
from sqlalchemy import select
from app.db.session import SessionLocal, engine
from app.db.base import Base
from app.models import User, UserRole, Broker, BrokerType, Strategy, StrategyStatus

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
def _hash(p: str): return pwd_context.hash(p)

def seed_admin_and_sample(admin_email: str, admin_password: str, admin_role: str = "admin"):
    with SessionLocal() as db:
        Base.metadata.create_all(bind=engine)
        user = db.execute(select(User).where(User.email == admin_email)).scalar_one_or_none()
        if not user:
            user = User(email=admin_email, password_hash=_hash(admin_password), role=UserRole(admin_role))
            db.add(user); db.flush()

        broker = db.execute(select(Broker).where(Broker.user_id == user.id, Broker.type == BrokerType.paper)).scalar_one_or_none()
        if not broker:
            broker = Broker(user_id=user.id, type=BrokerType.paper)
            db.add(broker); db.flush()

        strat = db.execute(select(Strategy).where(Strategy.user_id == user.id, Strategy.name == "Sample Breakout NG")).scalar_one_or_none()
        if not strat:
            strat = Strategy(
                user_id=user.id, name="Sample Breakout NG", symbol="NATURALGAS",
                timeframe="5m", qty="1", mode="paper", broker_id=broker.id, paper_trading=True,
                webhook_path=f"wh_{uuid.uuid4()}", status=StrategyStatus.active
            )
            db.add(strat)

        db.commit()
        return True
