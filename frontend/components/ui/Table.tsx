import { ReactNode } from 'react';

export function Table({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-auto border rounded-xl">
      <table className="min-w-full text-sm">{children}</table>
    </div>
  );
}
export function THead({ children }: { children: ReactNode }) {
  return (
    <thead className="bg-gray-50 sticky top-0">
      <tr className="[&>th]:text-left [&>th]:px-3 [&>th]:py-2 [&>th]:font-medium">{children}</tr>
    </thead>
  );
}
export function TBody({ children }: { children: ReactNode }) {
  return <tbody className="[&>tr:nth-child(even)]:bg-gray-50">{children}</tbody>
}
export function TR({ children }: { children: ReactNode }) {
  return <tr className="[&>td]:px-3 [&>td]:py-2">{children}</tr>;
}
export function TD({ children, numeric=false }: { children: ReactNode; numeric?: boolean }) {
  return <td className={numeric ? 'text-right' : ''}>{children}</td>;
}
export function TH({ children, numeric=false }: { children: ReactNode; numeric?: boolean }) {
  return <th className={numeric ? 'text-right' : ''}>{children}</th>;
}
