import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
export async function POST(req: Request) {
  const { token, exp } = await req.json().catch(()=>({}));
  if(!token) return NextResponse.json({ok:false,error:'token required'},{status:400});
  const maxAge = typeof exp === 'number' ? Math.max(0, exp - Math.floor(Date.now()/1000)) : 6*60*60;
  cookies().set('algodatta_token', token, { httpOnly:true, sameSite:'lax', secure:true, path:'/', maxAge });
  return NextResponse.json({ok:true});
}
