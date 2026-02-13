import Link from 'next/link';
import { STEPS } from '@/lib/steps';

export default function HomePage() {
  const totalQuestions = STEPS.reduce((sum, s) => sum + s.questionsPerStep, 0);

  return (
    <main className="min-h-screen bg-zinc-50 flex items-center justify-center px-4">
      <div className="max-w-xl w-full text-center">
        {/* Icon */}
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600 mb-8 shadow-sm">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
        </div>

        <h1 className="text-4xl sm:text-5xl font-bold text-zinc-900 mb-4">
          Solution Evaluation
        </h1>
        <p className="text-lg text-zinc-500 max-w-md mx-auto leading-relaxed mb-10">
          Answer a short set of questions to determine if a structured scorecard evaluation is recommended for your solution.
        </p>

        {/* Summary cards */}
        <div className="flex items-center justify-center gap-6 mb-10">
          <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 px-6 py-4 text-center">
            <div className="text-2xl font-bold text-zinc-900">{STEPS.length}</div>
            <div className="text-sm text-zinc-500 mt-0.5">Steps</div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 px-6 py-4 text-center">
            <div className="text-2xl font-bold text-zinc-900">{totalQuestions}</div>
            <div className="text-sm text-zinc-500 mt-0.5">Questions</div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 px-6 py-4 text-center">
            <div className="text-2xl font-bold text-zinc-900">~3m</div>
            <div className="text-sm text-zinc-500 mt-0.5">Duration</div>
          </div>
        </div>

        {/* CTA */}
        <Link
          href="/evaluate/gate"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-all duration-200 shadow-sm text-lg"
        >
          Begin Evaluation
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>

        <p className="text-sm text-zinc-400 mt-6">
          All questions must be answered to complete the evaluation
        </p>
      </div>
    </main>
  );
}
