'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from './Button';

interface CreateScorecardButtonProps {
  projectId: string;
  nextScorecardNumber?: number;
}

export function CreateScorecardButton({ projectId, nextScorecardNumber = 1 }: CreateScorecardButtonProps) {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleCreate = async () => {
    setIsCreating(true);
    setError('');

    try {
      const response = await fetch('/api/scorecard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          projectId,
          name: name.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!data.ok) {
        throw new Error(data.error?.message || 'Failed to create scorecard');
      }

      // Redirect to the first step of the scorecard
      router.push(`/scorecard/${data.data.scorecardRunId}/step/1`);
    } catch (err) {
      console.error('Error creating scorecard:', err);
      setError(err instanceof Error ? err.message : 'Failed to create scorecard');
      setIsCreating(false);
    }
  };

  const handleOpenModal = () => {
    setName('');
    setError('');
    setShowModal(true);
  };

  const handleCloseModal = () => {
    if (!isCreating) {
      setShowModal(false);
      setName('');
      setError('');
    }
  };

  return (
    <>
      <Button
        onClick={handleOpenModal}
        disabled={isCreating}
        variant="primary"
        size="sm"
      >
        Create Scorecard
      </Button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={handleCloseModal} />
          <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-xl font-semibold text-zinc-900 mb-3">Create Scorecard</h3>
            <div className="mb-6">
              <label htmlFor="scorecard-name" className="block text-sm font-medium text-zinc-700 mb-2">
                Scorecard Name (optional)
              </label>
              <input
                id="scorecard-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-zinc-400"
                placeholder={`Scorecard #${nextScorecardNumber}`}
                disabled={isCreating}
                autoFocus
              />
              {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleCloseModal}
                disabled={isCreating}
                className="px-4 py-2 rounded-lg font-medium text-zinc-700 border-2 border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={isCreating}
                className="px-4 py-2 rounded-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreating ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
