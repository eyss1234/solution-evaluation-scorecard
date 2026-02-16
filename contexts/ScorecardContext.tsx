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

interface OverviewData {
  pros?: string;
  cons?: string;
  summary?: string;
}

interface ScorecardContextValue {
  questions: ScorecardQuestion[];
  scores: Record<string, number>;
  stepComments: Record<number, string>;
  overview: OverviewData;
  setScore: (questionId: string, value: number) => void;
  setStepComment: (stepNumber: number, comment: string) => void;
  setOverview: (overview: OverviewData) => void;
  isStepComplete: (stepNumber: number) => boolean;
  isStepPartiallyComplete: (stepNumber: number) => boolean;
  getStepQuestions: (stepNumber: number) => ScorecardQuestion[];
  getStepScore: (stepNumber: number) => number | null;
  totalSteps: number;
  runId: string;
}

const ScorecardContext = createContext<ScorecardContextValue | null>(null);

export function ScorecardProvider({
  questions,
  runId,
  initialScores = {},
  initialStepComments = {},
  initialOverview = {},
  children,
}: {
  questions: ScorecardQuestion[];
  runId: string;
  initialScores?: Record<string, number>;
  initialStepComments?: Record<number, string>;
  initialOverview?: OverviewData;
  children: ReactNode;
}) {
  const [scores, setScores] = useState<Record<string, number>>(initialScores);
  const [stepComments, setStepCommentsState] = useState<Record<number, string>>(initialStepComments);
  const [overview, setOverviewState] = useState<OverviewData>(initialOverview);

  const setScore = useCallback((questionId: string, value: number) => {
    setScores((prev) => ({ ...prev, [questionId]: value }));
  }, []);

  const setStepComment = useCallback((stepNumber: number, comment: string) => {
    setStepCommentsState((prev) => ({ ...prev, [stepNumber]: comment }));
  }, []);

  const setOverview = useCallback((newOverview: OverviewData) => {
    setOverviewState(newOverview);
  }, []);

  const getStepQuestions = useCallback(
    (stepNumber: number): ScorecardQuestion[] => {
      return questions.filter((q) => q.stepNumber === stepNumber).sort((a, b) => a.order - b.order);
    },
    [questions]
  );

  const isStepComplete = useCallback(
    (stepNumber: number): boolean => {
      // Step 7 (Overview) is always complete since all fields are optional
      if (stepNumber === 7) return true;
      
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

  const getStepScore = useCallback(
    (stepNumber: number): number | null => {
      const stepQuestions = getStepQuestions(stepNumber);
      if (stepQuestions.length === 0 || !isStepComplete(stepNumber)) {
        return null;
      }

      // Calculate weighted average for the section
      let totalWeightedScore = 0;
      let totalWeight = 0;

      for (const question of stepQuestions) {
        const score = scores[question.id];
        if (score !== undefined) {
          // Normalize score to 0-1 range, then multiply by question weight
          const normalizedScore = score / 5;
          totalWeightedScore += normalizedScore * question.weight;
          totalWeight += question.weight;
        }
      }

      // Return section score as percentage (0-100)
      return totalWeight > 0 ? (totalWeightedScore / totalWeight) * 100 : 0;
    },
    [getStepQuestions, scores, isStepComplete]
  );

  return (
    <ScorecardContext.Provider
      value={{
        questions,
        scores,
        stepComments,
        overview,
        setScore,
        setStepComment,
        setOverview,
        isStepComplete,
        isStepPartiallyComplete,
        getStepQuestions,
        getStepScore,
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
