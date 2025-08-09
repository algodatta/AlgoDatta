import React from 'react';

export default function Alert({ type='info', message='' }: { type?: 'info'|'success'|'error', message: string }){
  const colors = {
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800'
  } as const;
  return (
    <div className={`border rounded p-3 my-2 ${colors[type]}`}>
      {message}
    </div>
  );
}