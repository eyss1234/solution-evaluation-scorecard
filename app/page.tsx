import { prisma } from '@/lib/db';
import { GatingForm } from '@/components/GatingForm';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const questions = await prisma.gateQuestion.findMany({
    orderBy: {
      order: 'asc',
    },
  });

  return (
    <main className="min-h-screen py-8 px-4 sm:py-12">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 mb-6 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent mb-4">
            Solution Evaluation
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Answer the following questions to determine if a structured scorecard evaluation is recommended for your solution
          </p>
        </div>

        {/* Form */}
        <GatingForm questions={questions} />

        {/* Footer note */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            All questions must be answered to proceed
          </p>
        </div>
      </div>
    </main>
  );
}
