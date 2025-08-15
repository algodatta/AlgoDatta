from decimal import Decimal
from typing import Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import select, func
from app.models import PaperTrade, Execution, Strategy

def _D(x): return Decimal(str(x))

def position_for_strategy(db: Session, strategy: Strategy) -> Dict[str, Any]:
    # Prefer paper snapshot if paper_trading
    if strategy.paper_trading:
        last = db.execute(
            select(PaperTrade).where(PaperTrade.strategy_id == strategy.id).order_by(PaperTrade.entry_time.desc()).limit(1)
        ).scalar_one_or_none()
        pos_qty = int(last.position_qty) if last and last.position_qty is not None else 0
        avg_price = str(last.avg_price) if last and last.avg_price is not None else None
        return {
            "strategy_id": str(strategy.id),
            "symbol": strategy.symbol,
            "mode": "paper",
            "position_qty": pos_qty,
            "avg_price": avg_price,
        }
    # Live (naive from executions for now)
    rows = db.execute(select(Execution).where(Execution.strategy_id == strategy.id).order_by(Execution.created_at.asc())).scalars().all()
    pos = Decimal(0); avg = Decimal(0)
    for e in rows:
        if e.side is None or e.qty is None or e.price is None: 
            continue
        qty = _D(e.qty); price = _D(e.price)
        if e.side.upper() == "BUY":
            if pos < 0:
                offset = min(qty, -pos)
                pos += offset
                qty -= offset
            if qty > 0:
                new_total = pos + qty
                if pos > 0:
                    avg = (avg * pos + price * qty) / new_total
                else:
                    avg = price
                pos = new_total
        elif e.side.upper() == "SELL":
            if pos > 0:
                offset = min(qty, pos)
                pos -= offset
                qty -= offset
            if qty > 0:
                new_total = pos - qty
                if pos < 0:
                    abs_new = -new_total if new_total != 0 else Decimal(1)
                    avg = (avg * (-pos) + price * qty) / abs_new
                else:
                    avg = price
                pos = new_total
    return {
        "strategy_id": str(strategy.id),
        "symbol": strategy.symbol,
        "mode": "live",
        "position_qty": int(pos),
        "avg_price": str(avg) if pos != 0 else None,
    }
