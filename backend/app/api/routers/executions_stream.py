from __future__ import annotations

import asyncio, json, time
from typing import AsyncGenerator, Set
from fastapi import APIRouter, Request, Header, Query
from fastapi.responses import StreamingResponse

router = APIRouter(prefix="/api/executions", tags=["executions"])

_subscribers: Set[asyncio.Queue] = set()
HEARTBEAT_SECONDS = 15

def _format_sse(data: dict | str) -> str:
    if isinstance(data, dict):
        payload = json.dumps(data, default=str)
    else:
        payload = str(data)
    return f"data: {payload}\n\n"

async def _event_generator(request: Request, q: asyncio.Queue) -> AsyncGenerator[bytes, None]:
    yield _format_sse({"msg": "connected", "ts": int(time.time())}).encode()
    last_heartbeat = time.monotonic()
    while True:
        if await request.is_disconnected():
            break
        try:
            item = await asyncio.wait_for(q.get(), timeout=HEARTBEAT_SECONDS)
            yield _format_sse(item).encode()
        except asyncio.TimeoutError:
            yield b": keep-alive\n\n"
        if time.monotonic() - last_heartbeat > HEARTBEAT_SECONDS:
            last_heartbeat = time.monotonic()

def _register_subscriber() -> asyncio.Queue:
    q: asyncio.Queue = asyncio.Queue(maxsize=1000)
    _subscribers.add(q)
    return q

def _unregister_subscriber(q: asyncio.Queue) -> None:
    try:
        _subscribers.discard(q)
    except Exception:
        pass

def publish_execution(event: dict) -> None:
    for q in list(_subscribers):
        try:
            if not q.full():
                q.put_nowait(event)
        except Exception:
            try: _subscribers.discard(q)
            except Exception: pass

@router.get("/stream")
async def stream(
    request: Request,
    token: str | None = Query(default=None, description="Optional auth token"),
    authorization: str | None = Header(default=None)
) -> StreamingResponse:
    q = _register_subscriber()
    async def gen():
        try:
            async for chunk in _event_generator(request, q):
                yield chunk
        finally:
            _unregister_subscriber(q)

    headers = {
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "X-Accel-Buffering": "no",
    }
    return StreamingResponse(gen(), media_type="text/event-stream", headers=headers)

@router.post("/stream/test")
async def stream_test() -> dict:
    publish_execution({"symbol": "TEST", "side": "BUY", "price": 123.45, "ts": time.time()})
    return {"ok": True}