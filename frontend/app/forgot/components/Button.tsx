'use client';
import React from 'react';

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md';
};

export default function Button({ variant='primary', size='md', className='', ...props }: Props) {
  const base = 'rounded-xl font-medium transition inline-flex items-center justify-center';
  const sizes = size === 'sm' ? 'h-9 px-3 text-sm' : 'h-10 px-4 text-sm';
  const variants = {
    primary: 'bg-slate-900 text-white hover:bg-slate-800',
    secondary: 'border border-slate-300 bg-white hover:bg-slate-50',
    ghost: 'hover:bg-slate-100'
  } as const;
  const v = variants[variant] || variants.primary;
  return <button {...props} className={`${base} ${sizes} ${v} ${className}`} />;
}
