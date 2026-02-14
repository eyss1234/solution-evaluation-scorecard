'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ConfirmModal } from './ConfirmModal';

interface DropdownMenuProps {
  onEdit: () => void;
  onDelete: () => void;
}

function DropdownMenu({ onEdit, onDelete }: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1 hover:bg-zinc-100 rounded transition-colors"
        aria-label="More options"
      >
        <svg className="w-5 h-5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-lg border border-zinc-200 py-1 z-10">
          <button
            onClick={() => {
              onEdit();
              setIsOpen(false);
            }}
            className="w-full text-left px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 transition-colors"
          >
            Edit name
          </button>
          <button
            onClick={() => {
              onDelete();
              setIsOpen(false);
            }}
            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

interface ScorecardActionsProps {
  runId: string;
  currentName: string | null;
  createdAt: Date;
  fallbackName: string;
}

export function ScorecardActions({ runId, currentName, createdAt, fallbackName }: ScorecardActionsProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [name, setName] = useState(currentName || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (isEditingName && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditingName]);

  const handleSaveName = async () => {
    if (!name.trim()) {
      setError('Scorecard name cannot be empty');
      return;
    }

    if (name.trim() === currentName) {
      setIsEditingName(false);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/scorecard/${runId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      });

      const data = await response.json();

      if (!data.ok) {
        throw new Error(data.error?.message || 'Failed to update scorecard');
      }

      setIsEditingName(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update scorecard');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setName(currentName || '');
    setError('');
    setIsEditingName(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveName();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);

    try {
      const response = await fetch(`/api/scorecard/${runId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!data.ok) {
        throw new Error(data.error?.message || 'Failed to delete scorecard');
      }

      router.refresh();
    } catch (err) {
      console.error('Error deleting scorecard:', err);
      alert('Failed to delete scorecard. Please try again.');
      setIsLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  const displayName = currentName || fallbackName;

  return (
    <>
      <div className="flex items-center justify-between mt-2">
        {isEditingName ? (
          <div className="flex-1">
            <input
              ref={inputRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleSaveName}
              className="font-medium text-zinc-900 border-2 border-indigo-500 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full"
              disabled={isLoading}
            />
            {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
          </div>
        ) : (
          <>
            <p className="font-medium text-zinc-900">{displayName}</p>
            <DropdownMenu
              onEdit={() => setIsEditingName(true)}
              onDelete={() => setShowDeleteConfirm(true)}
            />
          </>
        )}
      </div>

      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Scorecard"
        message="Delete this scorecard? This cannot be undone."
        confirmText="Delete Scorecard"
        confirmStyle="danger"
        isLoading={isLoading}
      />
    </>
  );
}
