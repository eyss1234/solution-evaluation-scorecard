'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { STEPS } from '@/lib/steps';
import { useScorecard } from '@/contexts/ScorecardContext';

export function ScorecardSidebar() {
  const pathname = usePathname();
  const { isStepComplete, runId } = useScorecard();

  const currentStepNumber = getCurrentStep(pathname);
  const isReview = pathname.endsWith('/review');

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-96 lg:fixed lg:inset-y-0 lg:left-0 bg-white border-r border-zinc-200 shadow-sm z-30">
        <div className="flex flex-col h-full">
          {/* Logo / Title */}
          <div className="p-6 border-b border-zinc-100">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <span className="text-base font-semibold text-zinc-900">Solution Evaluation</span>
            </Link>
          </div>

          {/* Gate status */}
          <div className="px-4 pt-6 pb-2">
            <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-green-50 border border-green-200">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-green-700">Gate Passed</div>
                <div className="text-xs text-green-600 mt-0.5">Scorecard evaluation unlocked</div>
              </div>
            </div>
          </div>

          {/* Steps */}
          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            <p className="text-xs uppercase tracking-wide text-zinc-500 font-medium px-3 mb-4">
              Scorecard Steps
            </p>
            {STEPS.map((step) => {
              const isActive = currentStepNumber === step.number;
              const isComplete = isStepComplete(step.number);
              const isPast = currentStepNumber !== null && step.number < currentStepNumber;

              return (
                <Link
                  key={step.number}
                  href={`/scorecard/${runId}/step/${step.number}`}
                  className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
                  }`}
                >
                  <StepIndicator isActive={isActive} isComplete={isComplete || isPast} />
                  <div className="flex-1 min-w-0">
                    <div className={`text-base font-medium truncate ${
                      isActive ? 'text-indigo-700' : 'text-zinc-700 group-hover:text-zinc-900'
                    }`}>
                      {step.name}
                    </div>
                    <div className="text-sm text-zinc-400 truncate mt-0.5">
                      {step.questionsPerStep} questions
                    </div>
                  </div>
                </Link>
              );
            })}

            {/* Review step */}
            <Link
              href={`/scorecard/${runId}/review`}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group ${
                isReview
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
              }`}
            >
              <StepIndicator isActive={isReview} isComplete={false} isReview />
              <div className="flex-1 min-w-0">
                <div className={`text-base font-medium truncate ${
                  isReview ? 'text-indigo-700' : 'text-zinc-700 group-hover:text-zinc-900'
                }`}>
                  Review & Submit
                </div>
              </div>
            </Link>
          </nav>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-zinc-200 shadow-sm z-30">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <span className="text-sm font-semibold text-zinc-900">Scorecard</span>
            </Link>
            {currentStepNumber !== null && (
              <span className="text-xs font-medium text-zinc-500">
                Step {currentStepNumber} of {STEPS.length}
              </span>
            )}
            {isReview && (
              <span className="text-xs font-medium text-indigo-600">Review</span>
            )}
          </div>
          {/* Progress dots */}
          <div className="flex items-center gap-2">
            {STEPS.map((step) => {
              const isActive = currentStepNumber === step.number;
              const isComplete = isStepComplete(step.number);
              return (
                <Link
                  key={step.number}
                  href={`/scorecard/${runId}/step/${step.number}`}
                  className="flex-1"
                >
                  <div
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      isActive
                        ? 'bg-indigo-600'
                        : isComplete
                          ? 'bg-indigo-300'
                          : 'bg-zinc-200'
                    }`}
                  />
                </Link>
              );
            })}
            <Link href={`/scorecard/${runId}/review`} className="flex-1">
              <div
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  isReview ? 'bg-indigo-600' : 'bg-zinc-200'
                }`}
              />
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

function StepIndicator({
  isActive,
  isComplete,
  isReview = false,
}: {
  isActive: boolean;
  isComplete: boolean;
  isReview?: boolean;
}) {
  if (isComplete && !isActive) {
    return (
      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
        <svg className="w-4 h-4 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      </div>
    );
  }

  if (isActive) {
    return (
      <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0">
        <div className="w-2.5 h-2.5 rounded-full bg-white" />
      </div>
    );
  }

  if (isReview) {
    return (
      <div className="w-8 h-8 rounded-full border-2 border-zinc-200 flex items-center justify-center flex-shrink-0">
        <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="w-8 h-8 rounded-full border-2 border-zinc-200 flex items-center justify-center flex-shrink-0">
      <div className="w-2 h-2 rounded-full bg-zinc-300" />
    </div>
  );
}

function getCurrentStep(pathname: string): number | null {
  const match = pathname.match(/\/step\/(\d+)/);
  if (match) return parseInt(match[1], 10);
  return null;
}
