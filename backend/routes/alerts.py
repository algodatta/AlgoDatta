from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
import os, json

from ..db import get_db
from ..security import get_current_user
from ..models import User

router = APIRouter()

PREFS_FILE = os.getenv("ALERT_PREFS_FILE", "/app/data/alert_prefs.json")

def _load_prefs():
    try:
        with open(PREFS_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return {}

def _save_prefs(data: dict):
    os.makedirs(os.path.dirname(PREFS_FILE), exist_ok=True)
    with open(PREFS_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f)

@router.get("/prefs")
def get_prefs(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    prefs = _load_prefs()
    return prefs.get(str(user.id), {"enable_telegram": False, "telegram_chat_id": "", "enable_email": False, "email": ""})

@router.post("/prefs")
def set_prefs(
    enable_telegram: bool = False,
    telegram_chat_id: Optional[str] = None,
    enable_email: bool = False,
    email: Optional[str] = None,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    prefs = _load_prefs()
    prefs[str(user.id)] = {
        "enable_telegram": bool(enable_telegram),
        "telegram_chat_id": telegram_chat_id or "",
        "enable_email": bool(enable_email),
        "email": email or ""
    }
    _save_prefs(prefs)
    return {"ok": True, "prefs": prefs[str(user.id)]}

def get_user_prefs(user_id: int):
    prefs = _load_prefs()
    return prefs.get(str(user_id), {})
