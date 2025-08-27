import { cookies } from 'next/headers';
// Minimal helper: decode unsigned JWT (not verifying).
// If you need verification, replace with jose/jwt verify using your public key.
export function getUserFromCookie(): { id?:string; email?:string; role?:'admin'|'user' } | null {
  const c = cookies().get('access_token')?.value;
  if (!c) return null;
  try {
    const payload = JSON.parse(Buffer.from(c.split('.')[1], 'base64').toString()) as any;
    return payload || null;
  } catch { return null; }
}
