import { ensureRateLimit } from '@/app/lib/rateLimiter';
import { logEvent } from '@/app/lib/jsonLogger';
import { NextResponse } from 'next/server';

// POST /api/secure/discord
// body: { content?: string, username?: string, embeds?: any[] }
export async function POST(request: Request) {
  try { ensureRateLimit(request); } catch (e) { return NextResponse.json({ ok: false, error: 'rate_limited' }, { status: 429 }); }
  const attempts = [0, 300, 700];
  let lastErr: any = null;
  for (let i = 0; i < attempts.length; i++) {
    try {
  const url = process.env.DISCORD_WEBHOOK_URL;
  if (!url) return NextResponse.json({ ok: false, error: 'DISCORD_WEBHOOK_URL not set' }, { status: 500 });

  const { content, username, embeds } = await request.json().catch(() => ({ content: undefined, username: undefined, embeds: undefined }));
  if (!content && !embeds) return NextResponse.json({ ok: false, error: 'Missing content or embeds' }, { status: 400 });

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ content, username, embeds }),
  });
  if (!res.ok) lastErr = { code: 'discord_failed', status: res.status }; if (i < attempts.length - 1) { await new Promise(r => setTimeout(r, attempts[i+1])); continue; } else { logEvent('secure_api_error', { service: 'discord', err: lastErr }); return NextResponse.json({ ok: false, error: 'Discord webhook failed', status: res.status }, { status: 502 }); }
  logEvent('secure_api_success', { service: 'discord' });
          return NextResponse.json({ ok: true });
}

    } catch (e: any) { lastErr = e; if (i < attempts.length - 1) { await new Promise(r => setTimeout(r, attempts[i+1])); continue; } }
  }
  logEvent('secure_api_error', { service: 'discord', err: lastErr?.message || lastErr });
  return NextResponse.json({ ok: false, error: 'upstream_error' }, { status: 502 });
}
