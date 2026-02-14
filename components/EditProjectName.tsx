'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface EditProjectNameProps {
  projectId: string;
  currentName: string;
}

export function EditProjectName({ projectId, currentName }: EditProjectNameProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(currentName);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Project name cannot be empty');
      return;
    }

    if (name.trim() === currentName) {
      setIsEditing(false);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      });

      const data = await response.json();

      if (!data.ok) {
        throw new Error(data.error?.message || 'Failed to update project');
      }

      setIsEditing(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update project');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setName(currentName);
    setError('');
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  if (isEditing) {
    return (
      <div className="space-y-1">
        <input
          ref={inputRef}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleSave}
          className="text-3xl sm:text-4xl font-bold text-zinc-900 border-2 border-indigo-500 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full"
          disabled={isLoading}
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 group">
      <h1 className="text-3xl sm:text-4xl font-bold text-zinc-900">{currentName}</h1>
      <button
        onClick={() => setIsEditing(true)}
        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-zinc-100 rounded"
        aria-label="Edit project name"
      >
        <svg className="w-5 h-5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
      </button>
    </div>
  );
}
