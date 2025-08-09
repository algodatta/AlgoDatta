from fastapi import APIRouter, Depends, Request, HTTPException
from fastapi.responses import StreamingResponse
from typing import List
from sqlalchemy.orm import Session
from time import sleep
import json

from ..db import get_db
from ..models import Execution, Strategy, User
from ..security import get_current_user
from ..auth_utils import decode_token  # for SSE query param token auth

router = APIRouter()

@router.get("", response_model=list[dict])
def list_executions(db: Session = Depends(get_db), user: User = Depends(get_current_user)) -> List[dict]:
    q = db.query(Execution)
    if not getattr(user, "is_admin", False):
        user_sids = [sid for (sid,) in db.query(Strategy.id).filter(Strategy.user_id == user.id).all()]
        if user_sids:
            q = q.filter(Execution.strategy_id.in_(user_sids))
        else:
            return []
    rows = q.order_by(Execution.id.desc()).limit(200).all()
    return [{
        "id": e.id, "strategy_id": e.strategy_id, "symbol": getattr(e, "symbol", None), "side": getattr(e, "side", None),
        "qty": getattr(e, "qty", None), "price": getattr(e, "price", None), "status": getattr(e, "status", None),
        "created_at": e.created_at.isoformat() if hasattr(e, "created_at") and e.created_at else None
    } for e in rows]

def _serialize(e: Execution) -> dict:
    return {
        "id": e.id, "strategy_id": e.strategy_id, "symbol": getattr(e, "symbol", None),
        "side": getattr(e, "side", None), "qty": getattr(e, "qty", None),
        "price": getattr(e, "price", None), "status": getattr(e, "status", None),
        "created_at": e.created_at.isoformat() if hasattr(e, "created_at") and e.created_at else None
    }

@router.get("/stream")
def stream_executions(request: Request, db: Session = Depends(get_db)):
    # Auth via Bearer token in headers OR ?token= query param (for EventSource which can't send headers easily)
    token = request.headers.get("Authorization", "").split(" ", 1)[1].strip() if request.headers.get("Authorization", "").startswith("Bearer ") else request.query_params.get("token", "")
    payload = decode_token(token) if token else None
    if not payload:
        raise HTTPException(status_code=401, detail="Unauthorized")
    uid = int(payload.get("sub", "0"))
    user = db.query(User).filter(User.id == uid).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    def event_stream():
        last_id = None
        while True:
            if await_client_disconnect(request):
                break
            q = db.query(Execution)
            if not getattr(user, "is_admin", False):
                user_sids = [sid for (sid,) in db.query(Strategy.id).filter(Strategy.user_id == user.id).all()]
                if user_sids:
                    q = q.filter(Execution.strategy_id.in_(user_sids))
                else:
                    q = q.filter(False)
            if last_id is not None:
                q = q.filter(Execution.id > last_id)
            batch = q.order_by(Execution.id.desc()).limit(20).all()
            if batch:
                # send newest first
                newest_id = max(e.id for e in batch)
                last_id = max(last_id or 0, newest_id)
                data = [_serialize(e) for e in sorted(batch, key=lambda x: x.id)]
                yield f"data: {json.dumps(data)}\n\n"
            else:
                # heartbeat to keep connection alive
                yield "data: []\n\n"
            sleep(2)  # basic polling; adjust as needed

    return StreamingResponse(event_stream(), media_type="text/event-stream")

def await_client_disconnect(request: Request) -> bool:
    # FastAPI/Starlette doesn't provide direct SSE disconnect checks; using client_disconnected flag on scope if available.
    try:
        return await_disconnect(request)
    except Exception:
        return False

def await_disconnect(request: Request) -> bool:
    # Non-blocking check: is the client disconnected?
    # Starlette sets 'client' state; here we just try accessing receive channel non-blockingly is not trivial.
    # We'll just check if the transport is closed where available; fallback returns False.
    try:
        if hasattr(request, 'is_disconnected'):
            return request.is_disconnected()
    except Exception:
        pass
    return False
