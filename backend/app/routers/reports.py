from fastapi import APIRouter, Response, Query
from datetime import datetime, timedelta
from typing import List, Dict

router = APIRouter(prefix="/api", tags=["reports"])

_EXECUTIONS: List[Dict] = [
    {"id":"ex-101","strategy_id":"strat-1","symbol":"NATURALGAS","side":"BUY","qty":1,"price":222.5,"status":"FILLED","timestamp":(datetime.utcnow()-timedelta(hours=1)).isoformat()+"Z","order_id":"DH123","exchange":"MCX"},
    {"id":"ex-102","strategy_id":"strat-2","symbol":"CRUDEOIL","side":"SELL","qty":1,"price":6950.0,"status":"FILLED","timestamp":(datetime.utcnow()-timedelta(minutes=30)).isoformat()+"Z","order_id":"DH124","exchange":"MCX"},
]

@router.get("/executions")
def executions(from_: str = Query(None, alias="from"), to: str = Query(None, alias="to"), limit: int = 500):
    def parse(ts: str):
        try: return datetime.fromisoformat(ts.replace("Z","+00:00"))
        except: return None
    f = parse(from_) if from_ else datetime.utcnow()-timedelta(days=1)
    t = parse(to) if to else datetime.utcnow()
    rows = [r for r in _EXECUTIONS if f <= parse(r["timestamp"]) <= t]
    return rows[:limit]

@router.get("/reports/csv")
def export_csv(from_: str = Query(None, alias="from"), to: str = Query(None, alias="to"), limit: int = 500):
    rows = executions(from_, to, limit)
    headers = ["id","strategy_id","symbol","side","qty","price","status","timestamp","order_id","exchange"]
    lines = [",".join(headers)]
    for r in rows:
        line = ",".join([str(r.get(h,"")) for h in headers])
        lines.append(line)
    csv_data = "\n".join(lines)
    return Response(content=csv_data, media_type="text/csv", headers={
        "Content-Disposition": "attachment; filename=executions.csv"
    })
