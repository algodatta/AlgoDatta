<<<<<<< HEAD
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default function Home() {
  const token = cookies().get('algodatta_token')?.value;
  redirect(token ? '/dashboard' : '/login');
=======

import { cookies } from 'next/headers';

import { redirect } from 'next/navigation';



export default function Home() {

  const token = cookies().get('algodatta_token')?.value;

  redirect(token ? '/dashboard' : '/login');

>>>>>>> 70c56dd2decfcb9a464e980fc93d3b81cb1e9180
}

