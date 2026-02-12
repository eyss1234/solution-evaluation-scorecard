import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';

interface ScorecardPageProps {
  params: Promise<{ runId: string }>;
}

export default async function ScorecardPage({ params }: ScorecardPageProps) {
  const { runId } = await params;

  const run = await prisma.gatingRun.findUnique({
    where: { id: runId },
    include: {
      answers: {
        include: {
          question: true,
        },
        orderBy: {
          question: {
            order: 'asc',
          },
        },
      },
    },
  });

  if (!run) {
    notFound();
  }

  const answeredYes = run.answers.filter((a) => a.value).length;

  return (
    <main className="min-h-screen py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <Card className="text-center">
          <div className="space-y-6">
            {/* Icon */}
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-green-100 to-emerald-200 mb-2">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>

            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
                Scorecard Recommended
              </h1>
              <p className="text-lg text-gray-600 max-w-xl mx-auto">
                Based on your responses, a structured solution evaluation scorecard is recommended for this project.
              </p>
            </div>

            {/* Summary Stats */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-3xl font-bold text-gray-900">{run.answers.length}</div>
                  <div className="text-sm text-gray-600 mt-1">Questions</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-green-600">{answeredYes}</div>
                  <div className="text-sm text-gray-600 mt-1">Yes Responses</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-blue-600">
                    {Math.round((answeredYes / run.answers.length) * 100)}%
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Match Score</div>
                </div>
              </div>
            </div>

            {/* Answers */}
            <div className="pt-6 border-t border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 text-left">
                Your Responses
              </h2>
              <div className="space-y-3">
                {run.answers.map((answer) => (
                  <div key={answer.id} className="flex items-start gap-3 text-left bg-gray-50 rounded-lg p-4 border border-gray-100">
                    <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                      answer.value ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {answer.value ? (
                        <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <span className="text-gray-700 flex-1 text-sm">
                      {answer.question.text}
                    </span>
                    <span className={`font-semibold text-sm ${answer.value ? 'text-green-600' : 'text-red-600'}`}>
                      {answer.value ? 'Yes' : 'No'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Next Steps */}
            <div className="pt-6 border-t border-gray-200">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100 text-left">
                <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  Next Steps
                </h3>
                <p className="text-blue-800 mb-4">
                  A comprehensive scorecard evaluation will help you:
                </p>
                <ul className="space-y-2 text-blue-800">
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Define and weight evaluation criteria</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Compare multiple solution options objectively</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Generate data-driven recommendations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Document decision rationale for stakeholders</span>
                  </li>
                </ul>
                <p className="text-sm text-blue-700 mt-4 italic">
                  Full scorecard functionality coming in next iteration
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-6 flex gap-3 justify-center">
              <Link href="/">
                <Button variant="secondary">Start New Evaluation</Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </main>
  );
}
