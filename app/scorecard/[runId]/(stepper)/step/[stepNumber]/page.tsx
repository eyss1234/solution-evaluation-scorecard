'use client';

import { useParams, notFound } from 'next/navigation';
import { isValidStep } from '@/lib/steps';
import { ScorecardStepForm } from '@/components/ScorecardStepForm';

export default function ScorecardStepPage() {
  const params = useParams();
  const stepNumber = parseInt(params.stepNumber as string, 10);

  if (!isValidStep(stepNumber)) {
    notFound();
  }

  return <ScorecardStepForm stepNumber={stepNumber} />;
}
