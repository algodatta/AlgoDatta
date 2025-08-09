import os, requests, smtplib
from email.mime.text import MIMEText

TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
SMTP_HOST = os.getenv("SMTP_HOST")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER")
SMTP_PASS = os.getenv("SMTP_PASS")
SMTP_FROM = os.getenv("SMTP_FROM", "alerts@example.com")

def send_telegram(chat_id: str, message: str):
    if not TELEGRAM_BOT_TOKEN or not chat_id:
        return {"ok": False, "error": "Missing bot token or chat id"}
    try:
        url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
        r = requests.post(url, json={"chat_id": chat_id, "text": message}, timeout=10)
        return r.json()
    except Exception as e:
        return {"ok": False, "error": str(e)}

def send_email(to_email: str, subject: str, message: str):
    if not SMTP_HOST or not SMTP_USER or not SMTP_PASS or not to_email:
        return {"ok": False, "error": "Missing SMTP config or recipient"}
    try:
        msg = MIMEText(message)
        msg["From"] = SMTP_FROM
        msg["To"] = to_email
        msg["Subject"] = subject
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as s:
            s.starttls()
            s.login(SMTP_USER, SMTP_PASS)
            s.sendmail(SMTP_FROM, [to_email], msg.as_string())
        return {"ok": True}
    except Exception as e:
        return {"ok": False, "error": str(e)}
