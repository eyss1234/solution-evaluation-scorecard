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
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <div className="space-y-6">
            <div className="text-center">
              <div className="text-6xl mb-4">✅</div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Scorecard Recommended
              </h1>
              <p className="text-lg text-gray-600">
                Based on your answers, a solution evaluation scorecard would be beneficial.
              </p>
            </div>

            <div className="pt-6 border-t border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Your Answers
              </h2>
              <div className="space-y-3">
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

            <div className="pt-6 border-t border-gray-200">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">
                  Summary
                </h3>
                <p className="text-blue-800">
                  You answered <strong>Yes</strong> to {answeredYes} out of {run.answers.length} questions.
                </p>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-3">
                Next Steps
              </h3>
              <p className="text-gray-600 mb-4">
                The full scorecard functionality will allow you to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-600 mb-6">
                <li>Define evaluation criteria</li>
                <li>Add solution options</li>
                <li>Score each solution against criteria</li>
                <li>View weighted results and rankings</li>
              </ul>
              <p className="text-sm text-gray-500 italic">
                (Scorecard functionality coming in next iteration)
              </p>
            </div>

            <div className="flex gap-4 pt-6">
              <Link href="/" className="flex-1">
                <Button variant="secondary" className="w-full">
                  Start Over
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </main>
  );
}
