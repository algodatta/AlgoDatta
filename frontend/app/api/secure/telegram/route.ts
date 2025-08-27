import { ensureRateLimit } from '@/app/lib/rateLimiter';
import { logEvent } from '@/app/lib/jsonLogger';
import { NextResponse } from 'next/server';

// POST /api/secure/telegram
// body: { chat_id?: string|number, text: string, parse_mode?: 'MarkdownV2'|'HTML'|'Markdown' }
export async function POST(request: Request) {
  try { ensureRateLimit(request); } catch (e) { return NextResponse.json({ ok: false, error: 'rate_limited' }, { status: 429 }); }
  const attempts = [0, 300, 700];
  let lastErr: any = null;
  for (let i = 0; i < attempts.length; i++) {
    try {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return NextResponse.json({ ok: false, error: 'TELEGRAM_BOT_TOKEN not set' }, { status: 500 });

  const { chat_id, text, parse_mode } = await request.json().catch(() => ({ chat_id: undefined, text: undefined }));
  const defaultChat = process.env.TELEGRAM_DEFAULT_CHAT_ID;
  const target = chat_id ?? defaultChat;
  if (!target) return NextResponse.json({ ok: false, error: 'Missing chat_id (or TELEGRAM_DEFAULT_CHAT_ID)' }, { status: 400 });
  if (!text) return NextResponse.json({ ok: false, error: 'Missing text' }, { status: 400 });

  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ chat_id: target, text, parse_mode }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data?.ok === false) lastErr = { code: 'telegram_failed', detail: data }; if (i < attempts.length - 1) { await new Promise(r => setTimeout(r, attempts[i+1])); continue; } else { logEvent('secure_api_error', { service: 'telegram', err: lastErr }); return NextResponse.json({ ok: false, error: 'Telegram send failed', detail: data }, { status: 502 }); }
  logEvent('secure_api_success', { service: 'telegram' });
          return NextResponse.json({ ok: true, result: data?.result });
}

    } catch (e: any) { lastErr = e; if (i < attempts.length - 1) { await new Promise(r => setTimeout(r, attempts[i+1])); continue; } }
  }
  logEvent('secure_api_error', { service: 'telegram', err: lastErr?.message || lastErr });
  return NextResponse.json({ ok: false, error: 'upstream_error' }, { status: 502 });
}
