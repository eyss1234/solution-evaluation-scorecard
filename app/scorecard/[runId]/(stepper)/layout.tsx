import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { ScorecardShell } from '@/components/ScorecardShell';

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

  return (
    <ScorecardShell questions={questions} runId={runId}>
      {children}
    </ScorecardShell>
  );
}
