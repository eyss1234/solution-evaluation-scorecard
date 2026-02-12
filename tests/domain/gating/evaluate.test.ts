import { describe, it, expect } from 'vitest';
import { evaluateGating } from '@/domain/gating/evaluate';
import type { GatingAnswer } from '@/domain/gating/types';

describe('evaluateGating', () => {
  it('should proceed when any answer is true', () => {
    const answers: GatingAnswer[] = [
      { questionId: '1', value: false },
      { questionId: '2', value: true },
      { questionId: '3', value: false },
    ];

    const result = evaluateGating(answers);

    expect(result.shouldProceed).toBe(true);
    expect(result.answeredYes).toBe(1);
    expect(result.totalQuestions).toBe(3);
  });

  it('should proceed when all answers are true', () => {
    const answers: GatingAnswer[] = [
      { questionId: '1', value: true },
      { questionId: '2', value: true },
      { questionId: '3', value: true },
    ];

    const result = evaluateGating(answers);

    expect(result.shouldProceed).toBe(true);
    expect(result.answeredYes).toBe(3);
    expect(result.totalQuestions).toBe(3);
  });

  it('should not proceed when all answers are false', () => {
    const answers: GatingAnswer[] = [
      { questionId: '1', value: false },
      { questionId: '2', value: false },
      { questionId: '3', value: false },
    ];

    const result = evaluateGating(answers);

    expect(result.shouldProceed).toBe(false);
    expect(result.answeredYes).toBe(0);
    expect(result.totalQuestions).toBe(3);
  });

  it('should handle empty answers array', () => {
    const answers: GatingAnswer[] = [];

    const result = evaluateGating(answers);

    expect(result.shouldProceed).toBe(false);
    expect(result.answeredYes).toBe(0);
    expect(result.totalQuestions).toBe(0);
  });

  it('should proceed with single true answer', () => {
    const answers: GatingAnswer[] = [
      { questionId: '1', value: true },
    ];

    const result = evaluateGating(answers);

    expect(result.shouldProceed).toBe(true);
    expect(result.answeredYes).toBe(1);
    expect(result.totalQuestions).toBe(1);
  });

  it('should not proceed with single false answer', () => {
    const answers: GatingAnswer[] = [
      { questionId: '1', value: false },
    ];

    const result = evaluateGating(answers);

    expect(result.shouldProceed).toBe(false);
    expect(result.answeredYes).toBe(0);
    expect(result.totalQuestions).toBe(1);
  });
});
