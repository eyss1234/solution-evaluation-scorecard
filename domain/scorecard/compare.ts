/**
 * Scorecard comparison logic - pure domain functions
 * Compares multiple scorecard runs side-by-side
 */

import { calculateOverallScore, type QuestionScore } from './calculate';

export interface StepScore {
  stepNumber: number;
  weightedScore: number; // 0-100
  rawTotal: number; // sum of 0-5 values
}

export interface RunComparisonData {
  runId: string;
  createdAt: Date;
  stepScores: StepScore[];
  overall: {
    weightedScore: number; // 0-100
    rawTotal: number; // sum of all 0-5 values
  };
}

export interface ComparisonResult {
  runs: RunComparisonData[];
  allStepNumbers: number[]; // unique step numbers across all runs
}

export interface ScorecardRunInput {
  id: string;
  createdAt: Date;
  scores: Array<{
    questionId: string;
    value: number; // 0-5
    question: {
      stepNumber: number;
      weight: number;
    };
  }>;
}

/**
 * Calculate comparison data for multiple scorecard runs
 * Reuses existing calculateOverallScore logic
 */
export function calculateRunComparison(
  runs: ScorecardRunInput[],
  sectionWeights: Map<number, number>
): ComparisonResult {
  const allStepNumbers = new Set<number>();
  const runComparisonData: RunComparisonData[] = [];

  for (const run of runs) {
    // Skip runs with no scores
    if (run.scores.length === 0) {
      continue;
    }

    // Transform scores to QuestionScore format
    const questionScores: QuestionScore[] = run.scores.map((s) => ({
      questionId: s.questionId,
      stepNumber: s.question.stepNumber,
      weight: s.question.weight,
      value: s.value,
    }));

    // Calculate overall score using existing logic
    const overallScore = calculateOverallScore(questionScores, sectionWeights);

    // Build step scores with raw totals
    const stepScores: StepScore[] = [];
    const scoresByStep = new Map<number, QuestionScore[]>();

    // Group scores by step
    for (const score of questionScores) {
      if (!scoresByStep.has(score.stepNumber)) {
        scoresByStep.set(score.stepNumber, []);
      }
      scoresByStep.get(score.stepNumber)!.push(score);
      allStepNumbers.add(score.stepNumber);
    }

    // Calculate step scores
    for (const [stepNumber, scores] of scoresByStep) {
      const sectionScore = overallScore.sectionScores.find(
        (s) => s.stepNumber === stepNumber
      );

      if (sectionScore) {
        // Calculate raw total (sum of all score values)
        const rawTotal = scores.reduce((sum, s) => sum + s.value, 0);

        stepScores.push({
          stepNumber,
          weightedScore: sectionScore.weightedScore,
          rawTotal,
        });
      }
    }

    // Sort step scores by step number
    stepScores.sort((a, b) => a.stepNumber - b.stepNumber);

    // Calculate overall raw total
    const overallRawTotal = questionScores.reduce((sum, s) => sum + s.value, 0);

    runComparisonData.push({
      runId: run.id,
      createdAt: run.createdAt,
      stepScores,
      overall: {
        weightedScore: overallScore.totalWeightedScore,
        rawTotal: overallRawTotal,
      },
    });
  }

  return {
    runs: runComparisonData,
    allStepNumbers: Array.from(allStepNumbers).sort((a, b) => a - b),
  };
}
