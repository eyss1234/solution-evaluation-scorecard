import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { Card } from '@/components/Card';
import { evaluateGating } from '@/domain/gating/evaluate';
import { CreateScorecardButton } from '@/components/CreateScorecardButton';
import { formatDate } from '@/lib/format';
import { calculateRunComparison, type ScorecardRunInput } from '@/domain/scorecard/compare';
import { ScorecardComparison } from '@/components/ScorecardComparison';
import { STEPS } from '@/lib/steps';
import { EditProjectName } from '@/components/EditProjectName';
import { DeleteProjectButton } from '@/components/DeleteProjectButton';
import { ScorecardItem } from '@/components/ScorecardItem';
import { FinancialComparison } from '@/components/FinancialComparison';
import type { Currency } from '@/domain/financial/format';

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
      financialEntries: {
        include: {
          costs: true,
        },
        orderBy: {
          order: 'asc',
        },
      },
      financialSettings: true,
    },
  });

  if (!project) {
    notFound();
  }

  const latestGatingRun = project.gatingRuns[0];
  let gatingStatus: 'not_started' | 'passed' | 'failed' = 'not_started';

  if (latestGatingRun) {
    const evaluation = evaluateGating(
      latestGatingRun.answers.map((a: { questionId: string; value: boolean }) => ({
        questionId: a.questionId,
        value: a.value,
      }))
    );
    gatingStatus = evaluation.shouldProceed ? 'passed' : 'failed';
  }

  const completedScorecardRuns = project.scorecardRuns.filter(
    (run: { scores: unknown[] }) => run.scores.length > 0
  );

  const sectionWeights = new Map<number, number>();
  STEPS.forEach((step) => {
    sectionWeights.set(step.number, step.sectionWeight);
  });

  const comparisonData = calculateRunComparison(
    completedScorecardRuns as ScorecardRunInput[],
    sectionWeights
  );

  const financialEntries = project.financialEntries.map((entry) => ({
    ...entry,
    costs: entry.costs.map((cost) => ({
      ...cost,
      amount: Number(cost.amount),
    })),
  }));

  const currency: Currency = project.financialSettings?.currency || 'GBP';

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
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <EditProjectName projectId={projectId} currentName={project.name} />
              <p className="text-zinc-500 mt-2">Created {formatDate(project.createdAt)}</p>
            </div>
            <div className="flex flex-col gap-2">
              <DeleteProjectButton projectId={projectId} projectName={project.name} />
            </div>
          </div>
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
              <Link 
                href={`/project/${projectId}/gate`}
                className="inline-flex items-center px-6 py-3 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-all duration-200 shadow-sm"
              >
                Start Gating Evaluation
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
                  {latestGatingRun.answers.filter((a: { value: boolean }) => a.value).length} of {latestGatingRun.answers.length} questions answered "Yes"
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
          <Card className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-zinc-900">Scorecards</h2>
              <CreateScorecardButton 
                projectId={projectId} 
                nextScorecardNumber={project.scorecardRuns.length + 1} 
              />
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
                {project.scorecardRuns.map((run: { id: string; name: string | null; scores: unknown[]; createdAt: Date }, index: number) => {
                  const runComparison = comparisonData.runs.find(r => r.runId === run.id);
                  
                  return (
                    <ScorecardItem
                      key={run.id}
                      run={run}
                      runComparison={runComparison}
                      index={index}
                      totalScorecards={project.scorecardRuns.length}
                    />
                  );
                })}
              </div>
            )}
          </Card>
        )}

        {/* Scorecard Comparison Section */}
        {gatingStatus === 'passed' && (
          <Card className="mb-6">
            <h2 className="text-xl font-semibold text-zinc-900 mb-4">Scorecard Comparison</h2>
            <ScorecardComparison comparisonData={comparisonData} />
          </Card>
        )}

        {/* Financial Comparison Section */}
        {gatingStatus === 'passed' && (
          <Card>
            <h2 className="text-xl font-semibold text-zinc-900 mb-4">Financial Comparison</h2>
            <FinancialComparison
              projectId={projectId}
              scorecardRuns={project.scorecardRuns}
              initialEntries={financialEntries}
              initialCurrency={currency}
            />
          </Card>
        )}
      </div>
    </main>
  );
}
