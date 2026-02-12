/**
 * Domain types for gating logic
 * Pure TypeScript - no framework dependencies
 */

export interface GateQuestion {
  id: string;
  text: string;
  order: number;
}

export interface GatingAnswer {
  questionId: string;
  value: boolean;
}

export interface GatingRun {
  id: string;
  answers: GatingAnswer[];
  createdAt: Date;
}

export interface GatingEvaluation {
  shouldProceed: boolean;
  answeredYes: number;
  totalQuestions: number;
}
