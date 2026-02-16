import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { ScorecardShell } from '@/components/ScorecardShell';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface StepperLayoutProps {
  children: React.ReactNode;
  params: Promise<{ runId: string }>;
}

export default async function StepperLayout({ children, params }: StepperLayoutProps) {
  const { runId } = await params;

  // Verify the scorecard run exists
  const scorecardRun = await prisma.scorecardRun.findUnique({
    where: { id: runId },
    include: {
      project: true,
    },
  });

  if (!scorecardRun) {
    notFound();
  }

  // Fetch scorecard questions
  const questionsRaw = await prisma.scorecardQuestion.findMany({
    orderBy: [{ stepNumber: 'asc' }, { order: 'asc' }],
  });

  // Parse criteria JSON and format for context
  const questions = questionsRaw.map((q) => ({
    id: q.id,
    text: q.text,
    stepNumber: q.stepNumber,
    order: q.order,
    weight: q.weight,
    criteria: q.criteria as Array<{ score: number; description: string }>,
  }));

  // Fetch existing scores for this run
  const existingScores = await prisma.scorecardScore.findMany({
    where: { runId },
  });

  // Convert to Record<questionId, value> and Record<questionId, comment>
  const initialScores = existingScores.reduce((acc, score) => {
    acc[score.questionId] = score.value;
    return acc;
  }, {} as Record<string, number>);

  // Fetch existing overview for this run
  const existingOverview = await prisma.scorecardOverview.findUnique({
    where: { runId },
  });

  const initialOverview = {
    pros: existingOverview?.pros || undefined,
    cons: existingOverview?.cons || undefined,
    summary: existingOverview?.summary || undefined,
  };

  // Fetch existing step comments for this run
  const existingStepComments = await prisma.scorecardStepComment.findMany({
    where: { runId },
  });

  const initialStepComments = existingStepComments.reduce((acc, stepComment) => {
    acc[stepComment.stepNumber] = stepComment.comment;
    return acc;
  }, {} as Record<number, string>);

  console.log('[Layout] Loading scorecard:', { runId, scoresCount: existingScores.length, initialScores });

  return (
    <ScorecardShell 
      questions={questions} 
      runId={runId} 
      projectId={scorecardRun.projectId} 
      initialScores={initialScores}
      initialStepComments={initialStepComments}
      initialOverview={initialOverview}
    >
      {children}
    </ScorecardShell>
  );
}
