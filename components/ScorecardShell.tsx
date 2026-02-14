'use client';

import { ScorecardProvider } from '@/contexts/ScorecardContext';
import { ScorecardSidebar } from '@/components/ScorecardSidebar';

interface ScorecardQuestion {
  id: string;
  text: string;
  stepNumber: number;
  order: number;
  weight: number;
  criteria: Array<{ score: number; description: string }>;
}

export function ScorecardShell({
  questions,
  runId,
  children,
}: {
  questions: ScorecardQuestion[];
  runId: string;
  children: React.ReactNode;
}) {
  return (
    <ScorecardProvider questions={questions} runId={runId}>
      <div className="min-h-screen bg-zinc-50">
        <ScorecardSidebar />
        {/* Main content area */}
        <main className="lg:pl-96">
          <div className="max-w-3xl mx-auto px-4 py-8 pt-24 lg:pt-8 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </ScorecardProvider>
  );
}
