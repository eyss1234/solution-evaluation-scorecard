'use client';

import { useRouter } from 'next/navigation';
import { useScorecard } from '@/context/ScorecardContext';
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

  if (!step) return null;

  const canProceed = isStepComplete(stepNumber);
  const isFirst = stepNumber === 1;
  const isLast = stepNumber === TOTAL_STEPS;

  const handleNext = () => {
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

      {/* Scale legend */}
      <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 p-6">
        <p className="text-sm uppercase tracking-wide text-zinc-500 font-medium mb-3">
          Grading Scale
        </p>
        <div className="flex flex-wrap gap-3">
          {[0, 1, 2, 3, 4, 5].map((value) => (
            <div key={value} className="flex items-center gap-1.5 text-sm text-zinc-600">
              <span className="w-6 h-6 rounded-lg bg-zinc-100 flex items-center justify-center text-xs font-bold text-zinc-700">
                {value}
              </span>
              <span>{SCALE_LABELS[value]}</span>
            </div>
          ))}
        </div>
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
              <h3 className="text-xl font-medium text-zinc-900 mb-6 leading-relaxed">
                {question.text}
              </h3>
              <div className="flex gap-2">
                {[0, 1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setScore(question.id, value)}
                    className={`flex-1 flex flex-col items-center gap-1 px-3 py-3 rounded-xl border-2 font-semibold transition-all duration-200 cursor-pointer ${
                      currentScore === value
                        ? getScoreStyle(value)
                        : 'border-zinc-200 bg-white hover:border-zinc-300 text-zinc-600 hover:text-zinc-800'
                    }`}
                  >
                    <span className="text-lg">{value}</span>
                    <span className="text-[10px] font-medium leading-tight hidden sm:block">
                      {SCALE_LABELS[value]}
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
          disabled={!canProceed}
          className="px-6 py-3 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-all duration-200 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isLast ? 'Review Scores' : 'Continue'}
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
