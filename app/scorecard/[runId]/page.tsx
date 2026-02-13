import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { STEPS } from '@/lib/steps';

const SCALE_LABELS: Record<number, string> = {
  0: 'N/A',
  1: 'Very Poor',
  2: 'Poor',
  3: 'Adequate',
  4: 'Good',
  5: 'Excellent',
};

interface ScorecardPageProps {
  params: Promise<{ runId: string }>;
}

export default async function ScorecardPage({ params }: ScorecardPageProps) {
  const { runId } = await params;

  const run = await prisma.gatingRun.findUnique({
    where: { id: runId },
    include: {
      answers: {
        include: { question: true },
        orderBy: { question: { order: 'asc' } },
      },
      scorecardRun: {
        include: {
          scores: {
            include: { question: true },
            orderBy: [{ question: { stepNumber: 'asc' } }, { question: { order: 'asc' } }],
          },
        },
      },
    },
  });

  if (!run) {
    notFound();
  }

  const scorecardRun = run.scorecardRun;
  const hasScorecard = scorecardRun && scorecardRun.scores.length > 0;

  // Scorecard stats
  const allScores = hasScorecard ? scorecardRun.scores.map((s) => s.value) : [];
  const nonZeroScores = allScores.filter((v) => v > 0);
  const avgScore = nonZeroScores.length > 0
    ? (nonZeroScores.reduce((a, b) => a + b, 0) / nonZeroScores.length).toFixed(1)
    : '0.0';

  return (
    <main className="min-h-screen bg-zinc-50 py-12 px-4">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <Card className="text-center">
          <div className="space-y-6">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-50 mb-2">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>

            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-3">
                {hasScorecard ? 'Evaluation Complete' : 'Scorecard Recommended'}
              </h1>
              <p className="text-lg text-zinc-500 max-w-xl mx-auto">
                {hasScorecard
                  ? 'Your scorecard evaluation has been submitted successfully.'
                  : 'Based on your responses, a structured scorecard evaluation is recommended.'}
              </p>
            </div>

            {/* Summary Stats */}
            {hasScorecard && (
              <div className="bg-zinc-50 rounded-2xl p-6 border border-zinc-100">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-3xl font-bold text-zinc-900">{scorecardRun.scores.length}</div>
                    <div className="text-sm text-zinc-500 mt-1">Scored</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-indigo-600">{avgScore}</div>
                    <div className="text-sm text-zinc-500 mt-1">Avg Score</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-zinc-900">{STEPS.length}</div>
                    <div className="text-sm text-zinc-500 mt-1">Steps</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Scorecard Scores by Step */}
        {hasScorecard && STEPS.map((step) => {
          const stepScores = scorecardRun.scores.filter((s) => s.question.stepNumber === step.number);
          if (stepScores.length === 0) return null;

          const stepAvg = stepScores.filter((s) => s.value > 0).length > 0
            ? (stepScores.filter((s) => s.value > 0).reduce((a, s) => a + s.value, 0) / stepScores.filter((s) => s.value > 0).length).toFixed(1)
            : '0.0';

          return (
            <Card key={step.number}>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-sm uppercase tracking-wide text-zinc-500 font-medium">
                    Step {step.number}
                  </p>
                  <h2 className="text-lg font-semibold text-zinc-900 mt-0.5">{step.name}</h2>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-indigo-600">{stepAvg}</div>
                  <div className="text-xs text-zinc-500">avg</div>
                </div>
              </div>
              <div className="space-y-3">
                {stepScores.map((score) => (
                  <div key={score.id} className="flex items-start gap-3 text-sm">
                    <span className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${getScoreBadgeStyle(score.value)}`}>
                      {score.value}
                    </span>
                    <span className="text-zinc-700 flex-1">{score.question.text}</span>
                    <span className={`font-medium flex-shrink-0 text-xs ${getScoreTextStyle(score.value)}`}>
                      {SCALE_LABELS[score.value]}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          );
        })}

        {/* If no scorecard yet, show CTA to start */}
        {!hasScorecard && (
          <Card>
            <div className="text-center space-y-4">
              <p className="text-zinc-600">
                Continue to the scorecard evaluation to score your solution across {STEPS.length} categories.
              </p>
              <Link href={`/scorecard/${runId}/step/1`}>
                <Button>Start Scorecard</Button>
              </Link>
            </div>
          </Card>
        )}

        {/* Actions */}
        <div className="flex gap-3 justify-center">
          <Link href="/">
            <Button variant="secondary">Start New Evaluation</Button>
          </Link>
        </div>
      </div>
    </main>
  );
}

function getScoreBadgeStyle(value: number): string {
  if (value === 0) return 'bg-zinc-100 text-zinc-600';
  if (value <= 2) return 'bg-red-50 text-red-700';
  if (value === 3) return 'bg-amber-50 text-amber-700';
  return 'bg-green-50 text-green-700';
}

function getScoreTextStyle(value: number): string {
  if (value === 0) return 'text-zinc-500';
  if (value <= 2) return 'text-red-500';
  if (value === 3) return 'text-amber-600';
  return 'text-green-600';
}
