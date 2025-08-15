from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
from app.api.deps import get_db
from app.services.instrument_cache import search

router = APIRouter(prefix="/instruments", tags=["instruments"])

@router.get("/search")
def search_instruments(q: str = Query(..., description="Symbol query, e.g., RELI"), exchange_segment: Optional[str] = Query(None), limit: int = 20, db: Session = Depends(get_db)):
    return search(db, q, exchange_segment=exchange_segment, limit=limit)
