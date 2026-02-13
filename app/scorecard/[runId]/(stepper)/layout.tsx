import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { ScorecardShell } from '@/components/ScorecardShell';

interface StepperLayoutProps {
  children: React.ReactNode;
  params: Promise<{ runId: string }>;
}

export default async function StepperLayout({ children, params }: StepperLayoutProps) {
  const { runId } = await params;

  // Verify the gating run exists and passed
  const gatingRun = await prisma.gatingRun.findUnique({
    where: { id: runId },
  });

  if (!gatingRun) {
    notFound();
  }

  // Fetch scorecard questions
  const questions = await prisma.scorecardQuestion.findMany({
    orderBy: [{ stepNumber: 'asc' }, { order: 'asc' }],
  });

  return (
    <ScorecardShell questions={questions} runId={runId}>
      {children}
    </ScorecardShell>
  );
}
