'use client';

import { formatDate } from '@/lib/format';
import { STEPS } from '@/lib/steps';
import type { RunComparisonData } from '@/domain/scorecard/compare';

interface ScorecardComparisonProps {
  comparisonData: {
    runs: RunComparisonData[];
    allStepNumbers: number[];
  };
}

export function ScorecardComparison({ comparisonData }: ScorecardComparisonProps) {
  const { runs, allStepNumbers } = comparisonData;

  if (runs.length === 0) {
    return (
      <div className="text-center py-8 text-zinc-500">
        <svg className="w-12 h-12 mx-auto mb-3 text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <p>No scorecards to compare yet</p>
      </div>
    );
  }

  if (runs.length === 1) {
    return (
      <div className="text-center py-8 text-zinc-500">
        <svg className="w-12 h-12 mx-auto mb-3 text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <p>Create another scorecard to compare</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b-2 border-zinc-200">
            <th className="text-left py-3 px-4 font-semibold text-zinc-900 bg-zinc-50 sticky left-0 z-10">
              Step
            </th>
            {runs.map((run, index) => (
              <th key={run.runId} className="text-center py-3 px-4 font-semibold text-zinc-900 bg-zinc-50 min-w-[140px]">
                <div className="text-sm">Scorecard {runs.length - index}</div>
                <div className="text-xs font-normal text-zinc-500 mt-1">
                  {formatDate(run.createdAt)}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {allStepNumbers.map((stepNumber) => {
            const step = STEPS.find((s) => s.number === stepNumber);
            if (!step) return null;

            return (
              <tr key={stepNumber} className="border-b border-zinc-100 hover:bg-zinc-50/50">
                <td className="py-4 px-4 font-medium text-zinc-900 bg-white sticky left-0 z-10">
                  <div className="text-sm">Step {stepNumber}</div>
                  <div className="text-xs text-zinc-500 font-normal mt-0.5">
                    {step.name}
                  </div>
                </td>
                {runs.map((run) => {
                  const stepScore = run.stepScores.find((s) => s.stepNumber === stepNumber);
                  
                  return (
                    <td key={run.runId} className="py-4 px-4 text-center">
                      {stepScore ? (
                        <div>
                          <div className="text-lg font-bold text-indigo-600">
                            {stepScore.weightedScore.toFixed(1)}
                          </div>
                          <div className="text-xs text-zinc-400 mt-1">
                            raw: {stepScore.rawTotal}
                          </div>
                        </div>
                      ) : (
                        <div className="text-zinc-300 text-sm">—</div>
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
          <tr className="border-t-2 border-zinc-200 bg-zinc-50 font-semibold">
            <td className="py-4 px-4 text-zinc-900 sticky left-0 z-10 bg-zinc-50">
              Overall Total
            </td>
            {runs.map((run) => (
              <td key={run.runId} className="py-4 px-4 text-center">
                <div className="text-xl font-bold text-indigo-600">
                  {run.overall.weightedScore.toFixed(1)}
                </div>
                <div className="text-xs text-zinc-500 mt-1">
                  raw: {run.overall.rawTotal}
                </div>
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
