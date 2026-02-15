'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ScorecardTitle, ScorecardActions } from './ScorecardActions';
import { formatDate } from '@/lib/format';
import type { RunComparisonData } from '@/domain/scorecard/compare';

function formatScore(value: number): string {
  const rounded = Math.round(value * 10) / 10;
  return rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(1);
}

interface ScorecardItemProps {
  run: {
    id: string;
    name: string | null;
    scores: unknown[];
    createdAt: Date;
  };
  runComparison: RunComparisonData | undefined;
  index: number;
  totalScorecards: number;
}

export function ScorecardItem({ run, runComparison, index, totalScorecards }: ScorecardItemProps) {
  const isCompleted = run.scores.length > 0;
  const router = useRouter();
  const [triggerEdit, setTriggerEdit] = useState(false);

  const handleCardClick = () => {
    router.push(`/scorecard/${run.id}/step/1`);
  };

  const handleEdit = () => {
    setTriggerEdit(prev => !prev);
  };

  return (
    <div onClick={handleCardClick} className="block p-4 rounded-xl border border-zinc-200 relative hover:shadow-md transition-shadow duration-200 cursor-pointer group">
      <div className="flex items-center justify-between gap-6">
        <div onClick={(e) => e.stopPropagation()}>
          <ScorecardTitle 
            runId={run.id} 
            currentName={run.name} 
            createdAt={run.createdAt}
            fallbackName={`Scorecard #${totalScorecards - index}`}
            triggerEdit={triggerEdit}
          />
        </div>
        <div onClick={(e) => e.stopPropagation()}>
          <ScorecardActions 
            runId={run.id} 
            onEdit={handleEdit}
            onDelete={() => {}}
          />
        </div>
      </div>
      <div className="flex items-center gap-3 mt-3">
        <p className="text-sm text-zinc-500">
          {isCompleted ? `${run.scores.length} questions answered` : 'Not started'} • {formatDate(run.createdAt)}
        </p>
      </div>
      {isCompleted && runComparison && (
        <div className="absolute bottom-4 right-4 flex items-baseline">
          <span className={`text-2xl ${
            runComparison.overall.weightedScore >= 80 ? 'text-green-600' :
            runComparison.overall.weightedScore >= 60 ? 'text-yellow-600' :
            'text-red-600'
          }`}>
            {formatScore(runComparison.overall.weightedScore)}
          </span>
          <span className="text-xs text-zinc-400 ml-1">/100</span>
        </div>
      )}
    </div>
  );
}
