from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select
from uuid import UUID
from typing import Optional
from pydantic import BaseModel
from app.api.deps import get_db, require_admin
from app.services.instrument_cache import load_csv
from app.models import Strategy

router = APIRouter(prefix="/admin/dhan", tags=["admin:dhan"], dependencies=[Depends(require_admin)])

@router.post("/instruments/upload")
async def upload_instruments(file: UploadFile = File(...), db: Session = Depends(get_db)):
    content = await file.read()
    count = load_csv(db, content)
    return {"ok": True, "rows": count}

class DhanConfig(BaseModel):
    dhan_security_id: Optional[str] = None
    dhan_exchange_segment: Optional[str] = None
    dhan_product_type: Optional[str] = None
    dhan_order_type: Optional[str] = None
    dhan_validity: Optional[str] = None
    paper_trading: Optional[bool] = None
    broker_id: Optional[UUID] = None

@router.post("/strategies/{strategy_id}/config")
def update_dhan_config(strategy_id: UUID, body: DhanConfig, db: Session = Depends(get_db)):
    s = db.get(Strategy, strategy_id)
    if not s:
        raise HTTPException(status_code=404, detail="Strategy not found")
    for k, v in body.model_dump(exclude_unset=True).items():
        setattr(s, k, v)
    db.add(s); db.commit(); db.refresh(s)
    return {"ok": True, "strategy_id": str(s.id)}
