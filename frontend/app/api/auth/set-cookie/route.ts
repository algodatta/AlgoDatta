import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const body = await req.json().catch(()=> ({}));
  const token = body?.token as string | undefined;
  const maxAge = Number(body?.maxAge ?? 60*60*24*7); // default 7 days
  if (!token) return NextResponse.json({ ok:false, error:'token required' }, { status:400 });
  cookies().set('algodatta_token', token, {
    httpOnly: true, sameSite: 'lax', secure: true, path: '/', maxAge
  });
  return NextResponse.json({ ok:true });
}
