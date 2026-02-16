'use client';

import { useParams, notFound } from 'next/navigation';
import { isValidStep } from '@/lib/steps';
import { ScorecardStepForm } from '@/components/ScorecardStepForm';
import { ScorecardOverviewForm } from '@/components/ScorecardOverviewForm';

export default function ScorecardStepPage() {
  const params = useParams();
  const stepNumber = parseInt(params.stepNumber as string, 10);

  if (!isValidStep(stepNumber)) {
    notFound();
  }

  // Step 7 is the Overview step with different UI
  if (stepNumber === 7) {
    return <ScorecardOverviewForm />;
  }

  return <ScorecardStepForm stepNumber={stepNumber} />;
}
