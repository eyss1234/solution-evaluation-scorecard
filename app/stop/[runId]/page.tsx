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
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <div className="text-center space-y-6">
            <div className="text-6xl">🛑</div>
            <h1 className="text-3xl font-bold text-gray-900">
              No Scorecard Needed
            </h1>
            <p className="text-lg text-gray-600">
              Based on your answers, a solution evaluation scorecard is not necessary at this time.
            </p>

            <div className="pt-6 border-t border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Your Answers
              </h2>
              <div className="space-y-3 text-left">
                {run.answers.map((answer) => (
                  <div key={answer.id} className="flex justify-between items-start">
                    <span className="text-gray-700 flex-1">
                      {answer.question.text}
                    </span>
                    <span className={`font-medium ml-4 ${answer.value ? 'text-green-600' : 'text-red-600'}`}>
                      {answer.value ? 'Yes' : 'No'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-6">
              <Link href="/">
                <Button variant="primary">Start Over</Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </main>
  );
}
