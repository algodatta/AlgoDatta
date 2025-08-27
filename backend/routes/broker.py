try:
    from app.core.secrets import settings  # central secrets loader
except Exception:
    import os
    class _Fallback:
        def __getattr__(self, k):
            return os.getenv(k)
    settings = _Fallback()

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
import requests
from sqlalchemy.orm import Session
from database.models import DhanCredential
from database.db import get_db
from utils.encryption import encrypt, decrypt

router = APIRouter()

class DhanCredentials(BaseModel):
    clientId: str
    apiKey: str
    apiSecret: str

@router.post("/broker/connect")
def connect_dhan(creds: DhanCredentials, db: Session = Depends(get_db)):
    headers = {
        "access-token": creds.apiKey,
        "client-id": creds.clientId
    }
    try:
        response = requests.get("https://api.dhan.co/user-details", headers=headers, timeout=5)
        response.raise_for_status()
    except requests.RequestException as e:
        raise HTTPException(status_code=401, detail=f"Connection failed: {str(e)}")

    encrypted_api_key = encrypt(creds.apiKey)
    encrypted_api_secret = encrypt(creds.apiSecret)

    existing = db.query(DhanCredential).filter_by(client_id=creds.clientId).first()
    if existing:
        existing.api_key = encrypted_api_key
        existing.api_settings.GENERIC_SECRET
    else:
        new_entry = DhanCredential(
            client_id=creds.clientId,
            api_key=encrypted_api_key,
            api_settings.GENERIC_SECRET
        )
        db.add(new_entry)
    db.commit()
    return {"message": "Connected and saved securely ✅"}

@router.get("/broker/account-info")
def get_account_info(db: Session = Depends(get_db)):
    cred = db.query(DhanCredential).order_by(DhanCredential.id.desc()).first()
    if not cred:
        raise HTTPException(status_code=404, detail="No credentials found")
    try:
        headers = {
            "access-token": decrypt(cred.api_key),
            "client-id": cred.client_id
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Decryption failed: {str(e)}")
    try:
        response = requests.get("https://api.dhan.co/user-details", headers=headers, timeout=5)
        response.raise_for_status()
    except requests.RequestException as e:
        raise HTTPException(status_code=401, detail=f"Failed to fetch account info: {str(e)}")
    return response.json()