import React from 'react';

type Props = {
  columns: { key: string; label: string }[];
  data: any[];
  emptyText?: string;
};

export default function DataTable({ columns, data, emptyText='No records' }: Props){
  return (
    <div className="overflow-x-auto bg-white rounded-xl shadow">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map(c => (
              <th key={c.key} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.length === 0 ? (
            <tr><td className="px-4 py-4 text-sm text-gray-500" colSpan={columns.length}>{emptyText}</td></tr>
          ) : data.map((row, i) => (
            <tr key={i} className="hover:bg-gray-50">
              {columns.map(c => (
                <td key={c.key} className="px-4 py-3 text-sm text-gray-700">
                  {typeof row[c.key] === 'object' ? JSON.stringify(row[c.key]) : String(row[c.key] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}