import csv, io
from typing import Iterable, Dict, List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import select, func
from app.models import DhanInstrument

HEADER_ALIASES = {
    "security_id": {"securityid","security_id","security id","securityId"},
    "trading_symbol": {"tradingsymbol","trading_symbol","trading symbol","symbol","symbol_name","tradingSymbol"},
    "exchange_segment": {"exchangesegment","exchange_segment","exchange segment","exchange","segment","exchangeSegment"},
    "name": {"name","company","companyname","company_name","description"},
}

def _norm(s: str) -> str:
    return s.strip().lower().replace("-", "").replace("_", "").replace(" ", "")

def _map_headers(headers: Iterable[str]) -> Dict[str, str]:
    mapping = {}
    for h in headers:
        k = _norm(h)
        for field, aliases in HEADER_ALIASES.items():
            if k in aliases or k == _norm(field):
                mapping[field] = h
    return mapping

def load_csv(db: Session, content: bytes, limit: Optional[int] = None) -> int:
    text = content.decode("utf-8", errors="ignore")
    rdr = csv.DictReader(io.StringIO(text))
    headers = rdr.fieldnames or []
    m = _map_headers(headers)
    count = 0
    for i, row in enumerate(rdr):
        if limit and i >= limit:
            break
        sec = (row.get(m.get('security_id','')) or '').strip()
        if not sec:
            continue
        sym = (row.get(m.get('trading_symbol','')) or '').strip() or None
        ex = (row.get(m.get('exchange_segment','')) or '').strip() or None
        nm = (row.get(m.get('name','')) or '').strip() or None

        existing = db.get(DhanInstrument, sec)
        if existing:
            existing.trading_symbol = sym
            existing.exchange_segment = ex
            existing.name = nm
            db.add(existing)
        else:
            db.add(DhanInstrument(security_id=sec, trading_symbol=sym, exchange_segment=ex, name=nm))
        count += 1
        if count % 1000 == 0:
            db.flush()
    db.commit()
    return count

def search(db: Session, query: str, exchange_segment: Optional[str] = None, limit: int = 20) -> List[Dict]:
    stmt = select(DhanInstrument)
    if query:
        q = f"%{query.upper()}%"
        stmt = stmt.where(func.upper(DhanInstrument.trading_symbol).like(q))
    if exchange_segment:
        stmt = stmt.where(DhanInstrument.exchange_segment == exchange_segment)
    rows = db.execute(stmt.limit(limit)).scalars().all()
    return [{
        'security_id': r.security_id,
        'trading_symbol': r.trading_symbol,
        'exchange_segment': r.exchange_segment,
        'name': r.name,
    } for r in rows]
