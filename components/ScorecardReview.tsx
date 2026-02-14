'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { STEPS } from '@/lib/steps';
import { useScorecard } from '@/contexts/ScorecardContext';

const SCALE_LABELS: Record<number, string> = {
  0: 'N/A',
  1: 'Very Poor',
  2: 'Poor',
  3: 'Adequate',
  4: 'Good',
  5: 'Excellent',
};

export function ScorecardReview() {
  const router = useRouter();
  const { questions, scores, getStepQuestions, isStepComplete, runId } = useScorecard();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const allComplete = STEPS.every((s) => isStepComplete(s.number));

  const handleSubmit = async () => {
    if (!allComplete) return;
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/scorecard/${runId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scores: questions.map((q) => ({
            questionId: q.id,
            value: scores[q.id],
          })),
        }),
      });

      const data = await response.json();

      if (!data.ok) {
        throw new Error(data.error?.message || 'Failed to submit scorecard');
      }

      router.push(`/scorecard/${runId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setIsSubmitting(false);
    }
  };

  // Count answered questions
  const answeredCount = Object.values(scores).filter((v) => v !== undefined).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <p className="text-sm uppercase tracking-wide text-zinc-500 font-medium mb-2">
          Final Step
        </p>
        <h1 className="text-2xl font-bold text-zinc-900">Review Your Scores</h1>
        <p className="text-zinc-500 mt-1">
          Review all your scores before submitting the scorecard evaluation.
        </p>
      </div>

      {/* Summary */}
      <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 p-6">
        <div className="grid grid-cols-2 gap-4 text-center max-w-md mx-auto">
          <div>
            <div className="text-3xl font-bold text-zinc-900">{questions.length}</div>
            <div className="text-sm text-zinc-500 mt-1">Total Questions</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-indigo-600">{answeredCount}</div>
            <div className="text-sm text-zinc-500 mt-1">Answered</div>
          </div>
        </div>
      </div>

      {/* Steps summary */}
      <div className="space-y-6">
        {STEPS.map((step) => {
          const stepQuestions = getStepQuestions(step.number);
          const complete = isStepComplete(step.number);

          return (
            <div
              key={step.number}
              className="bg-white rounded-2xl shadow-sm border border-zinc-100 p-8"
            >
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-sm uppercase tracking-wide text-zinc-500 font-medium">
                    Step {step.number}
                  </p>
                  <h2 className="text-lg font-semibold text-zinc-900 mt-0.5">{step.name}</h2>
                </div>
                <Link
                  href={`/scorecard/${runId}/step/${step.number}`}
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
                >
                  Edit
                </Link>
              </div>

              {!complete && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-700 font-medium">
                  Not all questions scored
                </div>
              )}

              {complete && (
                <div className="space-y-3">
                  {stepQuestions.map((q) => {
                    const value = scores[q.id];
                    return (
                      <div
                        key={q.id}
                        className="flex items-start gap-3 text-sm"
                      >
                        <span className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${getScoreBadgeStyle(value)}`}>
                          {value}
                        </span>
                        <span className="text-zinc-700 flex-1">{q.text}</span>
                        <span className={`font-medium flex-shrink-0 text-xs ${getScoreTextStyle(value)}`}>
                          {SCALE_LABELS[value]}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-xl flex items-start gap-3">
          <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <span className="font-medium">{error}</span>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-4">
        <Link
          href={`/scorecard/${runId}/step/${STEPS.length}`}
          className="px-6 py-3 rounded-xl font-semibold text-zinc-600 border-2 border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50 transition-all duration-200 shadow-sm"
        >
          Back
        </Link>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!allComplete || isSubmitting}
          className="px-8 py-3 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-all duration-200 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Submitting...
            </span>
          ) : (
            'Submit Scorecard'
          )}
        </button>
      </div>
    </div>
  );
}

function getScoreBadgeStyle(value: number): string {
  if (value === 0) return 'bg-zinc-100 text-zinc-600';
  if (value <= 2) return 'bg-red-50 text-red-700';
  if (value === 3) return 'bg-amber-50 text-amber-700';
  return 'bg-green-50 text-green-700';
}

function getScoreTextStyle(value: number): string {
  if (value === 0) return 'text-zinc-500';
  if (value <= 2) return 'text-red-500';
  if (value === 3) return 'text-amber-600';
  return 'text-green-600';
}
