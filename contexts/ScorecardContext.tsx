'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { STEPS, TOTAL_STEPS } from '@/lib/steps';

interface ScorecardQuestion {
  id: string;
  text: string;
  stepNumber: number;
  order: number;
  weight: number;
  criteria: Array<{ score: number; description: string }>;
}

interface ScorecardContextValue {
  questions: ScorecardQuestion[];
  scores: Record<string, number>;
  setScore: (questionId: string, value: number) => void;
  isStepComplete: (stepNumber: number) => boolean;
  isStepPartiallyComplete: (stepNumber: number) => boolean;
  getStepQuestions: (stepNumber: number) => ScorecardQuestion[];
  totalSteps: number;
  runId: string;
}

const ScorecardContext = createContext<ScorecardContextValue | null>(null);

export function ScorecardProvider({
  questions,
  runId,
  initialScores = {},
  children,
}: {
  questions: ScorecardQuestion[];
  runId: string;
  initialScores?: Record<string, number>;
  children: ReactNode;
}) {
  const [scores, setScores] = useState<Record<string, number>>(initialScores);

  const setScore = useCallback((questionId: string, value: number) => {
    setScores((prev) => ({ ...prev, [questionId]: value }));
  }, []);

  const getStepQuestions = useCallback(
    (stepNumber: number): ScorecardQuestion[] => {
      return questions.filter((q) => q.stepNumber === stepNumber).sort((a, b) => a.order - b.order);
    },
    [questions]
  );

  const isStepComplete = useCallback(
    (stepNumber: number): boolean => {
      const stepQuestions = getStepQuestions(stepNumber);
      return stepQuestions.length > 0 && stepQuestions.every((q) => scores[q.id] !== undefined);
    },
    [getStepQuestions, scores]
  );

  const isStepPartiallyComplete = useCallback(
    (stepNumber: number): boolean => {
      const stepQuestions = getStepQuestions(stepNumber);
      const answeredCount = stepQuestions.filter((q) => scores[q.id] !== undefined).length;
      return answeredCount > 0 && answeredCount < stepQuestions.length;
    },
    [getStepQuestions, scores]
  );

  return (
    <ScorecardContext.Provider
      value={{
        questions,
        scores,
        setScore,
        isStepComplete,
        isStepPartiallyComplete,
        getStepQuestions,
        totalSteps: TOTAL_STEPS,
        runId,
      }}
    >
      {children}
    </ScorecardContext.Provider>
  );
}

export function useScorecard(): ScorecardContextValue {
  const ctx = useContext(ScorecardContext);
  if (!ctx) {
    throw new Error('useScorecard must be used within a ScorecardProvider');
  }
  return ctx;
}
