import { prisma } from '@/lib/db';
import { ProjectList } from '@/components/ProjectList';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const projects = await prisma.project.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      gatingRuns: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        include: {
          answers: true,
        },
      },
      scorecardRuns: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  return (
    <main className="min-h-screen bg-zinc-50 py-8 px-4 sm:py-12">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-3">
            Solution Evaluation Scorecard
          </h1>
          <p className="text-lg text-zinc-500 max-w-2xl mx-auto leading-relaxed">
            Create and manage your solution evaluation projects. Each project includes gating questions and scorecard evaluations.
          </p>
        </div>

        {/* Project List */}
        <ProjectList projects={projects} />
      </div>
    </main>
  );
}
