import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
export async function POST(){ cookies().set('algodatta_token','',{httpOnly:true,sameSite:'lax',secure:true,path:'/',maxAge:0}); return NextResponse.json({ok:true}); }
