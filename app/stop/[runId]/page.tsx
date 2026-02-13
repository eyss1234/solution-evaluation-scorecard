import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';

interface StopPageProps {
  params: Promise<{ runId: string }>;
}

export default async function StopPage({ params }: StopPageProps) {
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

  return (
    <main className="min-h-screen bg-zinc-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <Card className="text-center">
          <div className="space-y-6">
            {/* Icon */}
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-zinc-100 mb-2">
              <svg className="w-10 h-10 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            </div>

            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-3">
                Scorecard Not Required
              </h1>
              <p className="text-lg text-zinc-500 max-w-xl mx-auto">
                Based on your responses, a formal solution evaluation scorecard is not necessary for this project at this time.
              </p>
            </div>

            {/* Summary Stats */}
            <div className="bg-zinc-50 rounded-2xl p-6 border border-zinc-100">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-3xl font-bold text-zinc-900">{run.answers.length}</div>
                  <div className="text-sm text-zinc-500 mt-1">Questions</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-red-500">
                    {run.answers.filter(a => !a.value).length}
                  </div>
                  <div className="text-sm text-zinc-500 mt-1">No Responses</div>
                </div>
              </div>
            </div>

            {/* Answers */}
            <div className="pt-6 border-t border-zinc-100">
              <h2 className="text-sm uppercase tracking-wide text-zinc-500 font-medium mb-6 text-left">
                Your Responses
              </h2>
              <div className="space-y-3">
                {run.answers.map((answer) => (
                  <div key={answer.id} className="flex items-start gap-3 text-left bg-zinc-50 rounded-xl p-4 border border-zinc-100">
                    <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                      answer.value ? 'bg-green-50' : 'bg-red-50'
                    }`}>
                      {answer.value ? (
                        <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <span className="text-zinc-700 flex-1 text-sm">
                      {answer.question.text}
                    </span>
                    <span className={`font-semibold text-sm ${answer.value ? 'text-green-600' : 'text-red-500'}`}>
                      {answer.value ? 'Yes' : 'No'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-6 flex gap-3 justify-center">
              <Link href="/">
                <Button variant="primary">Start New Evaluation</Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </main>
  );
}
