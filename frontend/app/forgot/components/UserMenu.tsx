'use client';
import React, { useState } from 'react';

export default function UserMenu({ name, email, avatarUrl }: { name: string | null; email: string | null; avatarUrl: string | null }) {
  const [open, setOpen] = useState(false);
  const letter = (name || email || 'U')[0]?.toUpperCase();
  return (
    <div className="relative">
      <button onClick={() => setOpen(o=>!o)} className="h-8 w-8 rounded-full bg-slate-200 overflow-hidden grid place-items-center">
        {avatarUrl ? <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" /> : <span className="text-slate-700 text-sm font-semibold">{letter}</span>}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-200 bg-white shadow-md overflow-hidden">
          <div className="px-3 py-2 border-b">
            <div className="text-sm font-medium">{name || 'User'}</div>
            <div className="text-xs text-slate-600 truncate">{email || ''}</div>
          </div>
          <a href="/settings/profile" className="block px-3 py-2 text-sm hover:bg-slate-50">Profile &amp; settings</a>
          <a href="/logout" className="block px-3 py-2 text-sm hover:bg-slate-50">Sign out</a>
        </div>
      )}
    </div>
  );
}
