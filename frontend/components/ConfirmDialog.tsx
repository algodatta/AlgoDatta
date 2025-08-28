'use client';
import React from 'react';
import Modal from './Modal';

type Props = {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
};

export default function ConfirmDialog({
  open, onCancel, onConfirm, title='Are you sure?', message, confirmText='Confirm', cancelText='Cancel'
}: Props) {
  if (!open) return null;
  return (
    <Modal open={open} onClose={onCancel} title={title} footer={
      <div className="flex justify-end gap-2">
        <button onClick={onCancel} className="h-10 px-4 rounded-xl border"> {cancelText} </button>
        <button onClick={onConfirm} className="h-10 px-4 rounded-xl bg-rose-600 text-white"> {confirmText} </button>
      </div>
    }>
      {message && <p className="text-sm text-slate-700">{message}</p>}
    </Modal>
  );
}
