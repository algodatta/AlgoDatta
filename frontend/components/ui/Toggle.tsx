'use client';
import { useId } from 'react';

interface ToggleProps {
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
  label?: string;
}
export default function Toggle({ checked, onChange, disabled, label }: ToggleProps) {
  const id = useId();
  return (
    <label htmlFor={id} className="inline-flex items-center gap-2 cursor-pointer select-none">
      {label && <span className="text-sm">{label}</span>}
      <span className={`relative inline-block h-6 w-11 rounded-full transition-colors ${checked ? 'bg-green-500' : 'bg-gray-300'} ${disabled ? 'opacity-50' : ''}`}>
        <input
          id={id}
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={e => onChange(e.target.checked)}
          disabled={disabled}
        />
        <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transform transition-transform ${checked ? 'translate-x-5' : ''}`}></span>
      </span>
    </label>
  );
}
