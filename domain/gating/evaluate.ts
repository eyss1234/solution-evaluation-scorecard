/**
 * Pure gating evaluation logic
 * Rule: Proceed if ANY answer is true
 */

import type { GatingAnswer, GatingEvaluation } from './types';

export function evaluateGating(answers: GatingAnswer[]): GatingEvaluation {
  const answeredYes = answers.filter((a) => a.value === true).length;
  const shouldProceed = answeredYes > 0;

  return {
    shouldProceed,
    answeredYes,
    totalQuestions: answers.length,
  };
}
