import { describe, it, expect } from 'vitest';
import { calculateRunComparison, type ScorecardRunInput } from '@/domain/scorecard/compare';

describe('calculateRunComparison', () => {
  const sectionWeights = new Map<number, number>([
    [1, 30],
    [2, 20],
    [3, 10],
    [4, 15],
    [5, 10],
    [6, 15],
  ]);

  it('should return empty result for empty runs array', () => {
    const runs: ScorecardRunInput[] = [];
    const result = calculateRunComparison(runs, sectionWeights);

    expect(result.runs).toHaveLength(0);
    expect(result.allStepNumbers).toHaveLength(0);
  });

  it('should skip runs with no scores', () => {
    const runs: ScorecardRunInput[] = [
      {
        id: 'run1',
        createdAt: new Date('2024-01-01'),
        scores: [],
      },
      {
        id: 'run2',
        createdAt: new Date('2024-01-02'),
        scores: [],
      },
    ];

    const result = calculateRunComparison(runs, sectionWeights);

    expect(result.runs).toHaveLength(0);
    expect(result.allStepNumbers).toHaveLength(0);
  });

  it('should calculate comparison for single run', () => {
    const runs: ScorecardRunInput[] = [
      {
        id: 'run1',
        createdAt: new Date('2024-01-01'),
        scores: [
          {
            questionId: 'q1',
            value: 5,
            question: { stepNumber: 1, weight: 1.0 },
          },
          {
            questionId: 'q2',
            value: 4,
            question: { stepNumber: 1, weight: 1.0 },
          },
          {
            questionId: 'q3',
            value: 3,
            question: { stepNumber: 2, weight: 1.0 },
          },
        ],
      },
    ];

    const result = calculateRunComparison(runs, sectionWeights);

    expect(result.runs).toHaveLength(1);
    expect(result.allStepNumbers).toEqual([1, 2]);

    const run = result.runs[0];
    expect(run.runId).toBe('run1');
    expect(run.stepScores).toHaveLength(2);

    // Step 1: (5+4) = 9 raw total
    const step1 = run.stepScores.find((s) => s.stepNumber === 1);
    expect(step1).toBeDefined();
    expect(step1!.rawTotal).toBe(9);
    expect(step1!.weightedScore).toBeCloseTo(90, 1); // (5/5 + 4/5) / 2 * 100 = 90

    // Step 2: 3 raw total
    const step2 = run.stepScores.find((s) => s.stepNumber === 2);
    expect(step2).toBeDefined();
    expect(step2!.rawTotal).toBe(3);
    expect(step2!.weightedScore).toBeCloseTo(60, 1); // 3/5 * 100 = 60

    // Overall: 5+4+3 = 12 raw total
    expect(run.overall.rawTotal).toBe(12);
    // Overall weighted: 90 * 0.30 + 60 * 0.20 = 27 + 12 = 39
    expect(run.overall.weightedScore).toBeCloseTo(39, 1);
  });

  it('should calculate comparison for multiple runs', () => {
    const runs: ScorecardRunInput[] = [
      {
        id: 'run1',
        createdAt: new Date('2024-01-01'),
        scores: [
          {
            questionId: 'q1',
            value: 5,
            question: { stepNumber: 1, weight: 1.0 },
          },
          {
            questionId: 'q2',
            value: 4,
            question: { stepNumber: 1, weight: 1.0 },
          },
        ],
      },
      {
        id: 'run2',
        createdAt: new Date('2024-01-02'),
        scores: [
          {
            questionId: 'q1',
            value: 3,
            question: { stepNumber: 1, weight: 1.0 },
          },
          {
            questionId: 'q2',
            value: 2,
            question: { stepNumber: 1, weight: 1.0 },
          },
        ],
      },
    ];

    const result = calculateRunComparison(runs, sectionWeights);

    expect(result.runs).toHaveLength(2);
    expect(result.allStepNumbers).toEqual([1]);

    // Run 1
    expect(result.runs[0].runId).toBe('run1');
    expect(result.runs[0].overall.rawTotal).toBe(9);
    expect(result.runs[0].stepScores[0].rawTotal).toBe(9);

    // Run 2
    expect(result.runs[1].runId).toBe('run2');
    expect(result.runs[1].overall.rawTotal).toBe(5);
    expect(result.runs[1].stepScores[0].rawTotal).toBe(5);
  });

  it('should handle runs with different steps', () => {
    const runs: ScorecardRunInput[] = [
      {
        id: 'run1',
        createdAt: new Date('2024-01-01'),
        scores: [
          {
            questionId: 'q1',
            value: 5,
            question: { stepNumber: 1, weight: 1.0 },
          },
        ],
      },
      {
        id: 'run2',
        createdAt: new Date('2024-01-02'),
        scores: [
          {
            questionId: 'q2',
            value: 4,
            question: { stepNumber: 2, weight: 1.0 },
          },
        ],
      },
      {
        id: 'run3',
        createdAt: new Date('2024-01-03'),
        scores: [
          {
            questionId: 'q3',
            value: 3,
            question: { stepNumber: 1, weight: 1.0 },
          },
          {
            questionId: 'q4',
            value: 2,
            question: { stepNumber: 3, weight: 1.0 },
          },
        ],
      },
    ];

    const result = calculateRunComparison(runs, sectionWeights);

    expect(result.runs).toHaveLength(3);
    expect(result.allStepNumbers).toEqual([1, 2, 3]);

    // Run 1 has only step 1
    expect(result.runs[0].stepScores).toHaveLength(1);
    expect(result.runs[0].stepScores[0].stepNumber).toBe(1);

    // Run 2 has only step 2
    expect(result.runs[1].stepScores).toHaveLength(1);
    expect(result.runs[1].stepScores[0].stepNumber).toBe(2);

    // Run 3 has steps 1 and 3
    expect(result.runs[2].stepScores).toHaveLength(2);
    expect(result.runs[2].stepScores[0].stepNumber).toBe(1);
    expect(result.runs[2].stepScores[1].stepNumber).toBe(3);
  });

  it('should handle weighted questions correctly', () => {
    const runs: ScorecardRunInput[] = [
      {
        id: 'run1',
        createdAt: new Date('2024-01-01'),
        scores: [
          {
            questionId: 'q1',
            value: 5,
            question: { stepNumber: 1, weight: 2.0 },
          },
          {
            questionId: 'q2',
            value: 3,
            question: { stepNumber: 1, weight: 1.0 },
          },
        ],
      },
    ];

    const result = calculateRunComparison(runs, sectionWeights);

    expect(result.runs).toHaveLength(1);

    const run = result.runs[0];
    const step1 = run.stepScores[0];

    // Raw total: 5 + 3 = 8
    expect(step1.rawTotal).toBe(8);

    // Weighted: (5/5 * 2.0 + 3/5 * 1.0) / (2.0 + 1.0) * 100
    // = (2.0 + 0.6) / 3.0 * 100 = 86.67
    expect(step1.weightedScore).toBeCloseTo(86.67, 1);
  });

  it('should sort step scores by step number', () => {
    const runs: ScorecardRunInput[] = [
      {
        id: 'run1',
        createdAt: new Date('2024-01-01'),
        scores: [
          {
            questionId: 'q3',
            value: 3,
            question: { stepNumber: 3, weight: 1.0 },
          },
          {
            questionId: 'q1',
            value: 5,
            question: { stepNumber: 1, weight: 1.0 },
          },
          {
            questionId: 'q2',
            value: 4,
            question: { stepNumber: 2, weight: 1.0 },
          },
        ],
      },
    ];

    const result = calculateRunComparison(runs, sectionWeights);

    const stepNumbers = result.runs[0].stepScores.map((s) => s.stepNumber);
    expect(stepNumbers).toEqual([1, 2, 3]);
  });
});
