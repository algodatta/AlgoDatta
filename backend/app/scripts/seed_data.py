
import os
from datetime import datetime, timedelta
import uuid
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import IntegrityError

# Import project models
from app.db import Base, get_db  # get_db not used here, but Base is
from app.models.user import User, UserRole, UserStatus
from app.models.broker import Broker
from app.models.strategy import Strategy, StrategyStatus
from app.models.alert import Alert
from app.models.execution import Execution, ExecutionStatus, ExecutionType

# Optional models: paper trade, notifications, error logs (if present)
try:
    from app.models.paper_trade import PaperTrade
except Exception:
    PaperTrade = None

try:
    from app.models.notification import Notification, NotificationMethod
except Exception:
    Notification = None
    NotificationMethod = None

try:
    from app.models.error_log import ErrorLog, ErrorType
except Exception:
    ErrorLog = None
    ErrorType = None

# Auth helpers
try:
    from app.services.auth_service import hash_password
except Exception:
    # Fallback if import path differs
    from passlib.context import CryptContext
    _settings.GENERIC_PASSWORD"bcrypt"], deprecated="auto")
    def hash_password(p): return _pwd.hash(p)

DATABASE_URL = os.getenv("DATABASE_URL", settings.POSTGRES_URL)

def get_engine():
    return create_engine(DATABASE_URL, echo=False, future=True)

def get_session(engine):
    return sessionmaker(bind=engine, autoflush=False, autocommit=False)()

def ensure_tables(engine):
    # Create all declared tables
    Base.metadata.create_all(bind=engine)

def seed():
    engine = get_engine()
    ensure_tables(engine)
    db = get_session(engine)

    try:
        # Users
        admin_id = uuid.uuid4()
        user_id = uuid.uuid4()
        admin = User(
            id=admin_id, email="admin@algodatta.io",
            password_hash=hash_password("Admin@123"),
            role=UserRole.admin, status=UserStatus.active
        )
        user = User(
            id=user_id, email="trader@algodatta.io",
            password_hash=hash_password("Trader@123"),
            role=UserRole.user, status=UserStatus.active
        )
        db.add_all([admin, user])
        db.commit()
    except IntegrityError:
        db.rollback()
        admin = db.query(User).filter(User.email=="admin@algodatta.io").first()
        user = db.query(User).filter(User.email=="trader@algodatta.io").first()
        admin_id = admin.id
        user_id = user.id

    # Brokers
    try:
        b1 = Broker(id=uuid.uuid4(), user_id=user_id, type="dhanhq", auth_token="mock_token_value")
        b2 = Broker(id=uuid.uuid4(), user_id=admin_id, type="paper", auth_token="paper_token")
        db.add_all([b1, b2])
        db.commit()
    except IntegrityError:
        db.rollback()

    # Strategies
    from uuid import uuid4
    import random

    # fetch brokers
    brokers = db.query(Broker).all()
    broker_map = {br.user_id: br for br in brokers}

    s1 = Strategy(
        id=uuid4(), user_id=user_id,
        name="NG Breakout Paper",
        script="strategy.entry('Buy', strategy.long)",
        broker_id=broker_map.get(user_id).id if broker_map.get(user_id) else None,
        paper_trading=True, webhook_path=f"webhook-{uuid4()}",
        status=StrategyStatus.active
    )
    s2 = Strategy(
        id=uuid4(), user_id=admin_id,
        name="Index Reversal Live",
        script="strategy.entry('Sell', strategy.short)",
        broker_id=broker_map.get(admin_id).id if broker_map.get(admin_id) else None,
        paper_trading=False, webhook_path=f"webhook-{uuid4()}",
        status=StrategyStatus.paused
    )
    db.add_all([s1, s2]); db.commit()

    # Notifications (if model exists)
    if Notification is not None:
        try:
            n1 = Notification(id=uuid.uuid4(), user_id=user_id, method=NotificationMethod.telegram, endpoint="123456789")
            n2 = Notification(id=uuid.uuid4(), user_id=user_id, method=NotificationMethod.email, endpoint="alerts@algodatta.io")
            db.add_all([n1, n2]); db.commit()
        except IntegrityError:
            db.rollback()

    # Alerts + Executions
    def add_alert_exec(strategy, symbol, signal, price, ok=True):
        al = Alert(id=uuid.uuid4(), strategy_id=strategy.id, symbol=symbol, signal=signal, price=price)
        db.add(al); db.commit()
        ex = Execution(
            id=uuid.uuid4(), alert_id=al.id,
            type=ExecutionType.paper if strategy.paper_trading else ExecutionType.live,
            status=ExecutionStatus.success if ok else ExecutionStatus.fail,
            response={"order_id": str(uuid.uuid4()), "status": "mocked" if ok else "error: rejected"}
        )
        db.add(ex); db.commit()
        return al, ex

    add_alert_exec(s1, "NSE:NATGAS", "buy", 212.4, ok=True)
    add_alert_exec(s1, "NSE:NATGAS", "sell", 214.1, ok=False)
    add_alert_exec(s2, "NSE:NIFTY", "sell", 22540.0, ok=True)

    # Paper trades (if available)
    if PaperTrade:
        try:
            pt1 = PaperTrade(
                id=uuid.uuid4(), strategy_id=s1.id, symbol="NSE:NATGAS", side="BUY",
                entry_price=212.4, qty=50, entry_time=datetime.utcnow()-timedelta(minutes=30),
                exit_price=214.0, exit_time=datetime.utcnow()-timedelta(minutes=5),
                pnl=(214.0-212.4)*50
            )
            db.add(pt1); db.commit()
        except IntegrityError:
            db.rollback()

    # Error logs (if available)
    if ErrorLog:
        try:
            el1 = ErrorLog(id=uuid.uuid4(), user_id=user_id, error_type=ErrorType.webhook,
                           message="Invalid payload key", details={"missing":"symbol"})
            el2 = ErrorLog(id=uuid.uuid4(), user_id=user_id, error_type=ErrorType.execution,
                           message="Order rejected", details={"reason":"Insufficient margin"})
            db.add_all([el1, el2]); db.commit()
        except IntegrityError:
            db.rollback()

    print("Seed complete: admin=admin@algodatta.io / Admin@123, user=trader@algodatta.io / Trader@123")

if __name__ == "__main__":
    seed()

# NOTE: This seed script already creates:
# - Users (admin/trader), brokers, strategies
# - Alerts, executions
# - Notifications (telegram/email) if Notification model exists
# - Error logs if ErrorLog model exists
# It is idempotent for core users and will not crash on re-run.
