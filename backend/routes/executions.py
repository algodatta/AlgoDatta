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
        "created_at": getattr(e, "created_at", None).isoformat() if getattr(e, "created_at", None) else None
    } for e in rows]

def _serialize(e: Execution) -> dict:
    return {
        "id": e.id, "strategy_id": e.strategy_id, "symbol": getattr(e, "symbol", None),
        "side": getattr(e, "side", None), "qty": getattr(e, "qty", None),
        "price": getattr(e, "price", None), "status": getattr(e, "status", None),
        "created_at": getattr(e, "created_at", None).isoformat() if getattr(e, "created_at", None) else None
    }

@router.get("/stream")
def stream_executions(request: Request, db: Session = Depends(get_db)):
    token = request.headers.get("Authorization", "")
    if token.startswith("Bearer "):
        token = token.split(" ", 1)[1].strip()
    else:
        token = request.query_params.get("token", "")
    payload = decode_token(token) if token else None
    if not payload:
        raise HTTPException(status_code=401, detail="Unauthorized")
    uid = int(payload.get("sub", "0"))
    user = db.query(User).filter(User.id == uid).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    def event_stream():
        last_id = 0
        while True:
            # simple loop with heartbeat; client close is handled by webserver automatically
            q = db.query(Execution)
            if not getattr(user, "is_admin", False):
                user_sids = [sid for (sid,) in db.query(Strategy.id).filter(Strategy.user_id == user.id).all()]
                if user_sids:
                    q = q.filter(Execution.strategy_id.in_(user_sids))
                else:
                    q = q.filter(False)
            if last_id:
                q = q.filter(Execution.id > last_id)
            batch = q.order_by(Execution.id.desc()).limit(20).all()
            if batch:
                last_id = max(e.id for e in batch)
                data = [_serialize(e) for e in sorted(batch, key=lambda x: x.id)]
                yield f"data: {json.dumps(data)}\n\n"
            else:
                yield "data: []\n\n"
            sleep(2)

    return StreamingResponse(event_stream(), media_type="text/event-stream")
