import os
import uuid
from passlib.context import CryptContext
from dotenv import load_dotenv
from sqlalchemy import select
from app.db.session import SessionLocal, engine
from app.db.base import Base
from app.models import User, UserRole, Broker, BrokerType, Strategy, StrategyStatus

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(p: str) -> str:
    return pwd_context.hash(p)

def run():
    load_dotenv()
    admin_email = os.getenv("ADMIN_EMAIL", "admin@algodatta.com")
    admin_password = os.getenv("ADMIN_PASSWORD", "ChangeMe123!")
    admin_role = os.getenv("ADMIN_ROLE", "admin")

    with SessionLocal() as db:
        Base.metadata.create_all(bind=engine)

        user = db.execute(select(User).where(User.email == admin_email)).scalar_one_or_none()
        if not user:
            user = User(email=admin_email, password_hash=hash_password(admin_password), role=UserRole(admin_role))
            db.add(user)
            db.flush()

        broker = db.execute(select(Broker).where(Broker.user_id == user.id, Broker.type == BrokerType.paper)).scalar_one_or_none()
        if not broker:
            broker = Broker(user_id=user.id, type=BrokerType.paper)
            db.add(broker)
            db.flush()

        strat = db.execute(select(Strategy).where(Strategy.user_id == user.id, Strategy.name == "Sample Breakout NG")).scalar_one_or_none()
        if not strat:
            strat = Strategy(
                user_id=user.id,
                name="Sample Breakout NG",
                symbol="NATURALGAS",
                timeframe="5m",
                qty="1",
                mode="paper",
                script="strategy.entry('Buy', strategy.long)",
                broker_id=broker.id,
                paper_trading=True,
                webhook_path=f"webhook-{uuid.uuid4()}",
                status=StrategyStatus.active,
            )
            db.add(strat)

        db.commit()
        print("Seed complete: admin user + sample strategy created.")

if __name__ == "__main__":
    run()
