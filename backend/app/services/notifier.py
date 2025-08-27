import httpx, smtplib
from email.message import EmailMessage
from typing import Optional
from app.core.config import settings

def send_telegram(chat_id: str, text: str) -> dict:
    if settings.notify_test_mode or not settings.telegram_bot_token:
        return {"ok": True, "test": True, "chat_id": chat_id, "text": text}
    url = f"https://api.telegram.org/bot{settings.telegram_bot_token}/sendMessage"
    with httpx.Client(timeout=10) as client:
        r = client.post(url, json={"chat_id": chat_id, "text": text})
    r.raise_for_status()
    return r.json()

def send_email(to_email: str, subject: str, body: str) -> dict:
    if settings.notify_test_mode or not settings.smtp_host:
        return {"ok": True, "test": True, "to": to_email, "subject": subject}
    msg = EmailMessage()
    msg["From"] = settings.smtp_from
    msg["To"] = to_email
    msg["Subject"] = subject
    msg.set_content(body)
    with smtplib.SMTP(settings.smtp_host, settings.smtp_port) as s:
        s.starttls()
        if settings.smtp_user:
            s.login(settings.smtp_user, settings.smtp_password)
        s.send_message(msg)
    return {"ok": True}
