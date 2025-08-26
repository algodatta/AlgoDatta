from typing import Optional
from pydantic import BaseModel, Field
from fastapi import APIRouter, Depends, HTTPException, status

# --- Defensive imports for DB + deps ---
SessionLocal = None
get_db = None
get_current_user = None
User = None

# Try common import paths for SessionLocal/get_db
for stmt in [
    "from app.db import SessionLocal",
    "from app.db.session import SessionLocal",
    "from app.database import SessionLocal",
]:
    try:
        exec(stmt, globals())
        if SessionLocal:
            break
    except Exception:
        pass

if SessionLocal and not get_db:
    def get_db():
        db = SessionLocal()
        try:
            yield db
        finally:
            try:
                db.close()
            except Exception:
                pass

# Try common paths for current user dependency
for stmt in [
    "from app.api.deps import get_current_user",
    "from app.core.deps import get_current_user",
    "from app.dependencies import get_current_user",
]:
    try:
        exec(stmt, globals())
        if get_current_user:
            break
    except Exception:
        pass

# Try pulling a Broker service or model
upsert_fn = None
for stmt in [
    "from app.services.brokers import upsert_broker as upsert_fn",
    "from app.services.broker_service import upsert as upsert_fn",
]:
    try:
        exec(stmt, globals())
        if upsert_fn:
            break
    except Exception:
        pass

Broker = None
for stmt in [
    "from app.models import Broker, User",
    "from app.models.broker import Broker; from app.models.user import User",
    "from app.db.models import Broker, User",
]:
    try:
        exec(stmt, globals())
        if Broker and User:
            break
    except Exception:
        pass

# Fallback SQLAlchemy detection (only used if service not found)
from sqlalchemy import select, update, insert
from sqlalchemy.exc import SQLAlchemyError

router = APIRouter(prefix="/broker", tags=["broker"])

class BrokerLinkIn(BaseModel):
    type: str = Field(default="dhanhq", description="Broker type (default: dhanhq)")
    client_id: str = Field(..., description="Broker client id")
    access_token: str = Field(..., description="Broker access token")


@router.post("", status_code=status.HTTP_200_OK)
def link_broker(payload: BrokerLinkIn, db=Depends(get_db), user=Depends(get_current_user)):
    """
    Link/update broker credentials for the current user.
    Prefers a service upsert if present; otherwise does a best-effort upsert
    into a 'brokers' table (if your model is available).
    """
    if not user:
        raise HTTPException(status_code=401, detail="Unauthorized")

    # Use service function if present
    if upsert_fn:
        try:
            upsert_fn(
                db=db,
                user_id=str(getattr(user, "id")),
                type=payload.type,
                client_id=payload.client_id,
                access_token=payload.access_token,
            )
            db.commit()
            return {"ok": True}
        except SQLAlchemyError as e:
            db.rollback()
            raise HTTPException(status_code=500, detail="DB error") from e
        except Exception:
            raise HTTPException(status_code=500, detail="Upsert failed")

    # Fallback: direct upsert if Broker model exists
    if not Broker:
        raise HTTPException(status_code=501, detail="Broker service/model not available")

    try:
        uid = getattr(user, "id")
        stmt_sel = select(Broker).where(
            getattr(Broker, "user_id") == uid,
            getattr(Broker, "type") == payload.type
        )
        existing = db.execute(stmt_sel).scalars().first()

        if existing:
            stmt_up = (
                update(Broker)
                .where(getattr(Broker, "id") == getattr(existing, "id"))
                .values(client_id=payload.client_id, access_token=payload.access_token)
            )
            db.execute(stmt_up)
        else:
            stmt_ins = insert(Broker).values(
                user_id=uid,
                type=payload.type,
                client_id=payload.client_id,
                access_token=payload.access_token,
            )
            db.execute(stmt_ins)

        db.commit()
        return {"ok": True}
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(status_code=500, detail="DB error")


@router.get("", status_code=status.HTTP_200_OK)
def link_status(db=Depends(get_db), user=Depends(get_current_user)):
    if not user:
        raise HTTPException(status_code=401, detail="Unauthorized")

    if not Broker:
        # Service may expose a getter; if not, just return unknown
        return {"linked": False, "type": None}

    try:
        uid = getattr(user, "id")
        stmt_sel = select(Broker).where(getattr(Broker, "user_id") == uid)
        existing = db.execute(stmt_sel).scalars().first()
        return {
            "linked": existing is not None,
            "type": getattr(existing, "type", None) if existing else None,
        }
    except SQLAlchemyError:
        return {"linked": False, "type": None}
