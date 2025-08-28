'use client';
import React from 'react';

type Props = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  wide?: boolean;
};

export default function Modal({ open, onClose, title, children, footer, wide }: Props) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute inset-x-0 top-[10%] flex justify-center p-4">
        <div className={`rounded-3xl border border-slate-200 bg-white shadow-xl ${wide ? 'w-[720px]' : 'w-[560px]'} max-w-full`}>
          <div className="p-5 border-b flex items-center justify-between">
            <div className="font-semibold">{title}</div>
            <button className="rounded-full h-8 w-8 grid place-items-center hover:bg-slate-100" onClick={onClose}>×</button>
          </div>
          <div className="p-5">{children}</div>
          {footer && <div className="p-4 border-t bg-slate-50/70 rounded-b-3xl">{footer}</div>}
        </div>
      </div>
    </div>
  );
}
