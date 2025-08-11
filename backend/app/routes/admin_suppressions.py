from __future__ import annotations

import csv, io, os
from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, Response, Security
from fastapi.security import APIKeyHeader
from pydantic import BaseModel
from sqlalchemy import select, desc, asc, func
from sqlalchemy.orm import Session

from app.db.suppressions import SessionLocal, Suppression

router = APIRouter(prefix="/admin/suppressions", tags=["Admin"])

api_key_header = APIKeyHeader(name="X-Admin-Token", auto_error=False)
ADMIN_API_KEY = os.getenv("ADMIN_API_KEY", "")

def admin_auth(api_key: Optional[str] = Security(api_key_header)) -> None:
    if not ADMIN_API_KEY or not api_key or api_key != ADMIN_API_KEY:
        raise HTTPException(status_code=401, detail="Unauthorized")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class SuppressionOut(BaseModel):
    id: int
    email: str
    kind: str
    created_at: datetime
    class Config:
        from_attributes = True  # pydantic v2
        orm_mode = True         # pydantic v1

class SuppressionList(BaseModel):
    total: int
    items: List[SuppressionOut]

@router.get("", response_model=SuppressionList, dependencies=[Depends(admin_auth)])
def list_suppressions(
    db: Session = Depends(get_db),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    kind: Optional[str] = Query(None, description="BOUNCE or COMPLAINT"),
    email: Optional[str] = Query(None, description="substring match"),
    since: Optional[datetime] = Query(None),
    until: Optional[datetime] = Query(None),
    sort: str = Query("-created_at", description="created_at or -created_at"),
    format: str = Query("json", pattern="^(json|csv)$"),
):
    filters = []
    if kind:
        filters.append(Suppression.kind == kind.upper())
    if email:
        filters.append(Suppression.email.ilike(f"%{email}%"))
    if since:
        filters.append(Suppression.created_at >= since)
    if until:
        filters.append(Suppression.created_at <= until)

    total = db.execute(select(func.count()).select_from(Suppression).where(*filters)).scalar_one()

    order_col = Suppression.created_at
    order = desc if sort.startswith("-") else asc
    rows = db.execute(
        select(Suppression).where(*filters).order_by(order(order_col)).offset(offset).limit(limit)
    ).scalars().all()

    if format == "csv":
        buf = io.StringIO()
        w = csv.writer(buf)
        w.writerow(["id", "email", "kind", "created_at"])
        for r in rows:
            w.writerow([r.id, r.email, r.kind, r.created_at.isoformat()])
        return Response(
            content=buf.getvalue(),
            media_type="text/csv",
            headers={"Content-Disposition": 'attachment; filename="suppressions.csv"'},
        )

    return {"total": int(total), "items": [SuppressionOut.model_validate(r) for r in rows]}

@router.get("/{sid}", response_model=SuppressionOut, dependencies=[Depends(admin_auth)])
def get_suppression(sid: int, db: Session = Depends(get_db)):
    row = db.get(Suppression, sid)
    if not row:
        raise HTTPException(404, "Not found")
    return row

@router.delete("/{sid}", status_code=204, dependencies=[Depends(admin_auth)])
def delete_suppression(sid: int, db: Session = Depends(get_db)):
    row = db.get(Suppression, sid)
    if not row:
        raise HTTPException(404, "Not found")
    db.delete(row)
    db.commit()
    return Response(status_code=204)

class UnsuppressIn(BaseModel):
    emails: List[str]

@router.post("/unsuppress", status_code=204, dependencies=[Depends(admin_auth)])
def bulk_unsuppress(body: UnsuppressIn, db: Session = Depends(get_db)):
    if not body.emails:
        return Response(status_code=204)
    db.query(Suppression).filter(Suppression.email.in_(body.emails)).delete(synchronize_session=False)
    db.commit()
    return Response(status_code=204)
