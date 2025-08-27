export function logEvent(event: string, meta: Record<string, any> = {}) {
  const entry = { ts: new Date().toISOString(), event, ...meta };
  try {
    // eslint-disable-next-line no-console
    console.log(JSON.stringify(entry));
  } catch {
    // best-effort
    console.log(`[${event}]`, meta);
  }
}
