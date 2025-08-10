from fastapi import APIRouter, Request
from app.db.session import SessionLocal
from app.services.suppression import suppress
from loguru import logger
import json, httpx

router = APIRouter()

@router.post("/ses-sns")
async def ses_sns(request: Request):
    # Handle AWS SNS messages for SES (bounces/complaints)
    headers = {k.lower(): v for k, v in request.headers.items()}
    msg_type = headers.get("x-amz-sns-message-type", "")
    body = await request.body()
    try:
        payload = json.loads(body.decode("utf-8"))
    except Exception:
        logger.error("Invalid JSON")
        return {"ok": False}

    if msg_type == "SubscriptionConfirmation":
        url = payload.get("SubscribeURL")
        logger.info(f"SNS SubscriptionConfirmation: confirm via: {url}")
        if url:
            try:
                async with httpx.AsyncClient(timeout=5.0) as client:
                    await client.get(url)
            except Exception as e:
                logger.warning(f"Auto-confirm failed (likely fine in local dev): {e}")
        return {"ok": True, "action": "confirm_subscription"}

    if msg_type == "Notification":
        message = payload.get("Message")
        try:
            m = json.loads(message)
        except Exception:
            logger.error("SNS Message is not JSON; skipping")
            return {"ok": False}

        ntype = m.get("notificationType")
        emails = []
        if ntype == "Bounce":
            for b in m.get("bounce", {}).get("bouncedRecipients", []):
                e = b.get("emailAddress")
                if e:
                    emails.append(("bounce", e, b))
        elif ntype == "Complaint":
            for c in m.get("complaint", {}).get("complainedRecipients", []):
                e = c.get("emailAddress")
                if e:
                    emails.append(("complaint", e, c))

        if emails:
            db = SessionLocal()
            try:
                for reason, email, detail in emails:
                    suppress(db, email, reason, detail)
                    logger.warning(f"Suppressed {email} due to {reason}")
            finally:
                db.close()
        return {"ok": True, "processed": len(emails)}

    if msg_type == "UnsubscribeConfirmation":
        logger.info("SNS UnsubscribeConfirmation received.")
        return {"ok": True, "action": "unsubscribe_confirmation"}

    logger.info(f"Unhandled SNS message type: {msg_type}")
    return {"ok": True}
