'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from './Button';

interface CreateScorecardButtonProps {
  projectId: string;
}

export function CreateScorecardButton({ projectId }: CreateScorecardButtonProps) {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    setIsCreating(true);

    try {
      const response = await fetch('/api/scorecard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ projectId }),
      });

      const data = await response.json();

      if (!data.ok) {
        throw new Error(data.error?.message || 'Failed to create scorecard');
      }

      // Redirect to the first step of the scorecard
      router.push(`/scorecard/${data.data.scorecardRunId}/step/1`);
    } catch (err) {
      console.error('Error creating scorecard:', err);
      alert(err instanceof Error ? err.message : 'Failed to create scorecard');
      setIsCreating(false);
    }
  };

  return (
    <Button
      onClick={handleCreate}
      disabled={isCreating}
      variant="primary"
      size="sm"
    >
      {isCreating ? 'Creating...' : 'Create Scorecard'}
    </Button>
  );
}
