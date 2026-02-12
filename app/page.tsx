import { prisma } from '@/lib/db';
import { GatingForm } from '@/components/GatingForm';

export default async function HomePage() {
  const questions = await prisma.gateQuestion.findMany({
    orderBy: {
      order: 'asc',
    },
  });

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Solution Evaluation Scorecard
          </h1>
          <p className="text-gray-600">
            Answer these questions to determine if you need a scorecard
          </p>
        </div>
        <GatingForm questions={questions} />
      </div>
    </main>
  );
}
