'use client';

import { useEffect } from 'react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  confirmStyle?: 'danger' | 'primary';
  isLoading?: boolean;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  confirmStyle = 'primary',
  isLoading = false,
}: ConfirmModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const confirmButtonClass =
    confirmStyle === 'danger'
      ? 'bg-red-600 hover:bg-red-700 text-white'
      : 'bg-indigo-600 hover:bg-indigo-700 text-white';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 p-6">
        <h3 className="text-xl font-semibold text-zinc-900 mb-3">{title}</h3>
        <p className="text-zinc-600 mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 rounded-lg font-medium text-zinc-700 border-2 border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${confirmButtonClass}`}
          >
            {isLoading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
