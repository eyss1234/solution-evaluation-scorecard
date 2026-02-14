'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useScorecard } from '@/contexts/ScorecardContext';
import { getStep, TOTAL_STEPS } from '@/lib/steps';

const SCALE_LABELS: Record<number, string> = {
  0: 'N/A',
  1: 'Very Poor',
  2: 'Poor',
  3: 'Adequate',
  4: 'Good',
  5: 'Excellent',
};

interface ScorecardStepFormProps {
  stepNumber: number;
}

export function ScorecardStepForm({ stepNumber }: ScorecardStepFormProps) {
  const router = useRouter();
  const { scores, setScore, getStepQuestions, isStepComplete, runId } = useScorecard();
  const step = getStep(stepNumber);
  const questions = getStepQuestions(stepNumber);
  const [isSaving, setIsSaving] = useState(false);

  if (!step) return null;

  const canProceed = isStepComplete(stepNumber);
  const isFirst = stepNumber === 1;
  const isLast = stepNumber === TOTAL_STEPS;

  const handleNext = async () => {
    // Save current step's answers before proceeding
    setIsSaving(true);
    try {
      const stepScores = questions
        .filter((q) => scores[q.id] !== undefined)
        .map((q) => ({
          questionId: q.id,
          value: scores[q.id],
        }));

      console.log('[StepForm] Saving step', stepNumber, ':', { stepScores, allScores: scores });

      if (stepScores.length > 0) {
        const response = await fetch(`/api/scorecard/${runId}/save`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ scores: stepScores }),
        });

        const data = await response.json();
        if (!data.ok) {
          console.error('[StepForm] Failed to save progress:', data.error);
        } else {
          console.log('[StepForm] Successfully saved:', data.data);
        }
      }
    } catch (error) {
      console.error('[StepForm] Error saving progress:', error);
    } finally {
      setIsSaving(false);
    }

    // Navigate to next step
    if (isLast) {
      router.push(`/scorecard/${runId}/review`);
    } else {
      router.push(`/scorecard/${runId}/step/${stepNumber + 1}`);
    }
  };

  const handleBack = () => {
    if (isFirst) {
      router.push('/');
    } else {
      router.push(`/scorecard/${runId}/step/${stepNumber - 1}`);
    }
  };

  return (
    <div className="space-y-8">
      {/* Step header */}
      <div>
        <p className="text-sm uppercase tracking-wide text-zinc-500 font-medium mb-2">
          Step {stepNumber} of {TOTAL_STEPS}
        </p>
        <h1 className="text-2xl font-bold text-zinc-900">{step.name}</h1>
        <p className="text-zinc-500 mt-1">{step.description}</p>
      </div>

      {/* Questions */}
      <div className="space-y-5">
        {questions.map((question) => {
          const currentScore = scores[question.id];
          return (
            <div
              key={question.id}
              className="bg-white rounded-2xl shadow-sm border border-zinc-100 p-8 transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-6">
                <h3 className="text-xl font-medium text-zinc-900 leading-relaxed flex-1">
                  {question.text}
                </h3>
                {question.weight && (
                  <span className="ml-4 px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-lg flex-shrink-0">
                    Weight: {question.weight}
                  </span>
                )}
              </div>
              <div className="space-y-2">
                {question.criteria && question.criteria.map((criterion) => (
                  <button
                    key={criterion.score}
                    type="button"
                    onClick={() => setScore(question.id, criterion.score)}
                    className={`w-full flex items-start gap-3 px-4 py-3 rounded-xl border-2 transition-all duration-200 cursor-pointer text-left ${
                      currentScore === criterion.score
                        ? getScoreStyle(criterion.score)
                        : 'border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50'
                    }`}
                  >
                    <span className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                      currentScore === criterion.score
                        ? 'bg-white/30'
                        : 'bg-zinc-100 text-zinc-700'
                    }`}>
                      {criterion.score}
                    </span>
                    <span className={`flex-1 text-sm leading-relaxed ${
                      currentScore === criterion.score
                        ? 'font-medium'
                        : 'text-zinc-700'
                    }`}>
                      {criterion.description}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4">
        <button
          type="button"
          onClick={handleBack}
          className="px-6 py-3 rounded-xl font-semibold text-zinc-600 border-2 border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50 transition-all duration-200 shadow-sm"
        >
          Back
        </button>
        <button
          type="button"
          onClick={handleNext}
          disabled={!canProceed || isSaving}
          className="px-6 py-3 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-all duration-200 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isSaving ? 'Saving...' : isLast ? 'Review Scores' : 'Continue'}
        </button>
      </div>
    </div>
  );
}

function getScoreStyle(value: number): string {
  if (value === 0) return 'border-zinc-400 bg-zinc-50 text-zinc-700';
  if (value <= 2) return 'border-red-200 bg-red-50 text-red-700';
  if (value === 3) return 'border-amber-200 bg-amber-50 text-amber-700';
  return 'border-green-300 bg-green-50 text-green-700';
}
