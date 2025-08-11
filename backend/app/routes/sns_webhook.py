from __future__ import annotations

import json, os, logging, urllib.parse
from typing import Any, Dict, List, Optional

import httpx
from fastapi import APIRouter, Header, Request
from fastapi.responses import JSONResponse

try:
    from sns_message_validator import Message, MessageValidator  # optional
    HAS_VALIDATOR = True
    _validator = MessageValidator()
except Exception:
    HAS_VALIDATOR = False
    _validator = None  # type: ignore

from app.db.suppressions import record_suppressions

router = APIRouter()
log = logging.getLogger("sns")
log.setLevel(logging.INFO)

ALLOWED_SNS_TOPICS = {a.strip() for a in os.getenv("ALLOWED_SNS_TOPICS", "").split(",") if a.strip()}

def _topic_allowed(topic_arn: Optional[str]) -> bool:
    return not ALLOWED_SNS_TOPICS or (topic_arn in ALLOWED_SNS_TOPICS)

def _lightweight_origin_check(payload: Dict[str, Any]) -> bool:
    cert = payload.get("SigningCertURL", "")
    try:
        u = urllib.parse.urlparse(cert)
        return u.scheme == "https" and u.hostname and u.hostname.endswith(".amazonaws.com")
    except Exception:
        return False

@router.post("/api/notifications/ses-sns")
async def ses_sns(
    request: Request,
    x_amz_sns_message_type: Optional[str] = Header(default=None),
    x_amz_sns_topic_arn: Optional[str] = Header(default=None),
) -> JSONResponse:
    try:
        payload: Dict[str, Any] = await request.json()
    except Exception:
        return JSONResponse({"ok": True})

    msg_type = payload.get("Type") or (x_amz_sns_message_type or "")
    topic_arn = payload.get("TopicArn") or x_amz_sns_topic_arn

    if not _topic_allowed(topic_arn):
        log.warning("SNS message from unexpected topic: %s", topic_arn)
        return JSONResponse({"ok": True})

    # Validate signature
    if HAS_VALIDATOR:
        try:
            _validator.validate(Message(payload))
        except Exception as e:
            log.warning("SNS signature validation failed: %s", e)
            return JSONResponse({"error": "invalid signature"}, status_code=400)
    else:
        if not _lightweight_origin_check(payload):
            log.warning("SNS origin check failed (install sns-message-validator)")
            return JSONResponse({"error": "invalid origin"}, status_code=400)

    if msg_type == "SubscriptionConfirmation":
        try:
            async with httpx.AsyncClient(timeout=10) as client:
                await client.get(payload["SubscribeURL"])
            log.info("SNS subscription confirmed for topic: %s", topic_arn)
        except Exception as e:
            log.exception("Failed confirming SNS subscription: %s", e)
        return JSONResponse({"ok": True, "confirmed": True})

    if msg_type == "Notification":
        body = payload.get("Message", "{}")
        try:
            event = json.loads(body)
        except json.JSONDecodeError:
            log.info("SES raw message: %s", body)
            return JSONResponse({"ok": True})

        event_type = (event.get("eventType") or event.get("notificationType") or "").upper()

        if event_type == "BOUNCE":
            recips = (event.get("bounce") or {}).get("bouncedRecipients", []) or []
            emails = [r.get("emailAddress") for r in recips if r.get("emailAddress")]
            saved = record_suppressions(emails, "BOUNCE", event)
            log.warning("SES BOUNCE %s (saved=%d)", emails, saved)
            return JSONResponse({"ok": True})

        if event_type == "COMPLAINT":
            recips = (event.get("complaint") or {}).get("complainedRecipients", []) or []
            emails = [r.get("emailAddress") for r in recips if r.get("emailAddress")]
            saved = record_suppressions(emails, "COMPLAINT", event)
            log.warning("SES COMPLAINT %s (saved=%d)", emails, saved)
            return JSONResponse({"ok": True})

        # Others (DELIVERY, OPEN, CLICK, etc.)
        log.info("SES %s: %s", event_type or "UNKNOWN", event)
        return JSONResponse({"ok": True})

    if msg_type == "UnsubscribeConfirmation":
        log.info("SNS unsubscribe confirmed: %s", payload.get("SubscribeURL"))
        return JSONResponse({"ok": True, "unsubscribed": True})

    return JSONResponse({"ok": True})
