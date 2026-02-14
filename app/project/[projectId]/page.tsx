import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { Card } from '@/components/Card';
import { evaluateGating } from '@/domain/gating/evaluate';
import { CreateScorecardButton } from '@/components/CreateScorecardButton';

interface ProjectPageProps {
  params: Promise<{ projectId: string }>;
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { projectId } = await params;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      gatingRuns: {
        orderBy: { createdAt: 'desc' },
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
      },
      scorecardRuns: {
        orderBy: { createdAt: 'desc' },
        include: {
          scores: {
            include: {
              question: true,
            },
          },
        },
      },
    },
  });

  if (!project) {
    notFound();
  }

  const latestGatingRun = project.gatingRuns[0];
  let gatingStatus: 'not_started' | 'passed' | 'failed' = 'not_started';

  if (latestGatingRun) {
    const evaluation = evaluateGating(
      latestGatingRun.answers.map((a) => ({
        questionId: a.questionId,
        value: a.value,
      }))
    );
    gatingStatus = evaluation.shouldProceed ? 'passed' : 'failed';
  }

  return (
    <main className="min-h-screen bg-zinc-50 py-8 px-4 sm:py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="text-indigo-600 hover:text-indigo-700 font-medium text-sm mb-4 inline-flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Projects
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold text-zinc-900 mt-2">{project.name}</h1>
          <p className="text-zinc-500 mt-2">Created {new Date(project.createdAt).toLocaleDateString()}</p>
        </div>

        {/* Gating Status Card */}
        <Card className="mb-6">
          <h2 className="text-xl font-semibold text-zinc-900 mb-4">Gating Evaluation</h2>
          
          {gatingStatus === 'not_started' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-zinc-600">
                <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium">Not Started</p>
                  <p className="text-sm text-zinc-500">Begin with the gating questions to determine if a scorecard is needed</p>
                </div>
              </div>
              <Link href={`/project/${projectId}/gate`}>
                <Button>Start Gating Evaluation</Button>
              </Link>
            </div>
          )}

          {gatingStatus === 'passed' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-green-700">
                <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium">Gate Passed</p>
                  <p className="text-sm text-zinc-500">Scorecard evaluation is recommended for this project</p>
                </div>
              </div>
              <div className="pt-4 border-t border-zinc-100">
                <p className="text-sm text-zinc-600 mb-3">
                  {latestGatingRun.answers.filter(a => a.value).length} of {latestGatingRun.answers.length} questions answered "Yes"
                </p>
              </div>
            </div>
          )}

          {gatingStatus === 'failed' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-red-600">
                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium">Gate Failed</p>
                  <p className="text-sm text-zinc-500">Scorecard evaluation is not required for this project</p>
                </div>
              </div>
              <div className="pt-4 border-t border-zinc-100">
                <p className="text-sm text-zinc-600">
                  All gating questions were answered "No"
                </p>
              </div>
            </div>
          )}
        </Card>

        {/* Scorecards Section */}
        {gatingStatus === 'passed' && (
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-zinc-900">Scorecards</h2>
              <CreateScorecardButton projectId={projectId} />
            </div>

            {project.scorecardRuns.length === 0 ? (
              <div className="text-center py-8 text-zinc-500">
                <svg className="w-12 h-12 mx-auto mb-3 text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p>No scorecards created yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {project.scorecardRuns.map((run, index) => (
                  <Link key={run.id} href={`/scorecard/${run.id}/step/1`}>
                    <div className="flex items-center justify-between p-4 rounded-xl border border-zinc-200 hover:border-indigo-300 hover:bg-indigo-50/50 transition-all cursor-pointer">
                      <div>
                        <p className="font-medium text-zinc-900">
                          Scorecard #{project.scorecardRuns.length - index}
                        </p>
                        <p className="text-sm text-zinc-500">
                          {run.scores.length > 0 ? `${run.scores.length} questions answered` : 'Not started'} • {new Date(run.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </Card>
        )}
      </div>
    </main>
  );
}
