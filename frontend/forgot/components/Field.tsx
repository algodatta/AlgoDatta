'use client';
import React from 'react';

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string | null;
  hint?: string;
};

export default function Field({ label, error, hint, className='', ...props }: Props) {
  return (
    <div>
      {label && <label className="block text-sm font-medium mb-1">{label}</label>}
      <input
        {...props}
        className={`w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-slate-300 ${error ? 'border-rose-300' : 'border-slate-300'} ${className}`}
      />
      {error ? <p className="text-rose-700 text-xs mt-1">{error}</p> : (hint ? <p className="text-slate-500 text-xs mt-1">{hint}</p> : null)}
    </div>
  );
}
