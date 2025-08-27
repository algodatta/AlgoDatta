import asyncio, logging, json
from typing import Any, Dict, Optional
import httpx
from app.core.secrets import settings

log = logging.getLogger("notifier")

async def _retryable_post(url: str, payload: Dict[str, Any], attempts = (0.0, 0.3, 0.7)) -> bool:
    last_exc: Optional[Exception] = None
    for i, backoff in enumerate(attempts):
        try:
            async with httpx.AsyncClient(timeout=10) as client:
                r = await client.post(url, json=payload)
                if r.status_code < 300:
                    log.info("notify_ok", service=url.split('/')[2], status=r.status_code)
                    return True
                last_exc = Exception(f"status_{r.status_code}")
        except Exception as e:  # network or timeout
            last_exc = e
        if i < len(attempts) - 1:
            await asyncio.sleep(backoff)
    log.error("notify_fail", service=url.split('/')[2], err=str(last_exc))
    return False

async def send_slack(text: str, blocks: Optional[Dict[str, Any]] = None) -> bool:
    url = settings.SLACK_WEBHOOK_URL
    if not url: 
        log.warning("notify_skip", reason="SLACK_WEBHOOK_URL not set")
        return False
    payload: Dict[str, Any] = {"text": text}
    if blocks: payload["blocks"] = blocks
    return await _retryable_post(url, payload)

async def send_discord(content: str, embeds: Optional[list] = None, username: Optional[str] = None) -> bool:
    url = settings.DISCORD_WEBHOOK_URL
    if not url:
        log.warning("notify_skip", reason="DISCORD_WEBHOOK_URL not set")
        return False
    payload: Dict[str, Any] = {"content": content}
    if username: payload["username"] = username
    if embeds: payload["embeds"] = embeds
    return await _retryable_post(url, payload)

async def send_telegram(text: str, chat_id: Optional[str] = None) -> bool:
    token = settings.TELEGRAM_BOT_TOKEN
    if not token:
        log.warning("notify_skip", reason="TELEGRAM_BOT_TOKEN not set")
        return False
    target = chat_id or getattr(settings, "TELEGRAM_DEFAULT_CHAT_ID", None)
    if not target:
        log.warning("notify_skip", reason="no chat_id")
        return False
    url = f"https://api.telegram.org/bot{token}/sendMessage"
    payload = {"chat_id": target, "text": text}
    return await _retryable_post(url, payload)


def build_slack_trade_blocks(title: str, detail: dict) -> list[dict]:
    # Build a Slack Block Kit message for trade events
    blocks = [
        {"type": "header", "text": {"type": "plain_text", "text": title}},
        {"type": "section", "fields": [
            {"type": "mrkdwn", "text": f"*Symbol*\n{detail.get('symbol','?')}"},
            {"type": "mrkdwn", "text": f"*Side*\n{detail.get('side','?')}"},
            {"type": "mrkdwn", "text": f"*Qty*\n{detail.get('qty','?')}"},
            {"type": "mrkdwn", "text": f"*Status*\n{detail.get('status','?')}"},
        ]},
    ]
    if detail.get("price"):
        blocks.append({"type": "section","fields":[{"type":"mrkdwn","text": f"*Price*\n{detail['price']}"}]})
    if detail.get("order_id"):
        blocks.append({"type": "context","elements":[{"type":"mrkdwn","text": f"Order ID: `{detail['order_id']}`"}]})
    return blocks

async def notify_error(event: str, detail: dict, err: str | None = None):
    text = f"[AlgoDatta][ERROR] {event}: {detail}"
    # Slack rich block
    blocks = [
        {"type": "header", "text": {"type": "plain_text", "text": f"❌ {event}"}},
        {"type": "section", "text": {"type": "mrkdwn", "text": f"*Detail*\n```{str(detail)[:900]}```"}},
    ]
    if err:
        blocks.append({"type": "section", "text": {"type":"mrkdwn", "text": f"*Error*\n```{err[:900]}```"}})
    await asyncio.gather(
        send_slack(text, blocks=blocks),
        send_discord(text),
        send_telegram(text),
    )
