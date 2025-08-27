<<<<<<< HEAD
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
export default function Logout(){
  const r = useRouter();
  useEffect(()=>{
    localStorage.removeItem('token'); localStorage.removeItem('role');
    fetch('/api/auth/logout',{method:'POST'}).finally(()=> r.replace('/login'));
  },[r]);
  return <div className="card" style={{maxWidth:420, margin:'40px auto'}}>Signing out…</div>;
=======

'use client';

import { useEffect } from 'react';

import { useRouter } from 'next/navigation';

export default function Logout(){

  const r = useRouter();

  useEffect(()=>{

    localStorage.removeItem('token'); localStorage.removeItem('role');

    fetch('/api/auth/logout',{method:'POST'}).finally(()=> r.replace('/login'));

  },[r]);

  return <div className="card" style={{maxWidth:420, margin:'40px auto'}}>Signing out…</div>;

>>>>>>> 70c56dd2decfcb9a464e980fc93d3b81cb1e9180
}

