export interface StepDefinition {
  number: number;
  name: string;
  description: string;
  questionsPerStep: number;
}

export const STEPS: StepDefinition[] = [
  {
    number: 1,
    name: 'Strategic Fit',
    description: 'Alignment with strategic objectives and technology landscape',
    questionsPerStep: 8,
  },
  {
    number: 2,
    name: 'Risk & Compliance',
    description: 'Data protection, regulatory compliance, and operational risk',
    questionsPerStep: 8,
  },
  {
    number: 3,
    name: 'Cost & Resources',
    description: 'Total cost of ownership, resource requirements, and timelines',
    questionsPerStep: 8,
  },
  {
    number: 4,
    name: 'User Impact & Adoption',
    description: 'End-user needs, change management, and adoption readiness',
    questionsPerStep: 8,
  },
];

export const TOTAL_STEPS = STEPS.length;

export function getStep(stepNumber: number): StepDefinition | undefined {
  return STEPS.find((s) => s.number === stepNumber);
}

export function isValidStep(stepNumber: number): boolean {
  return stepNumber >= 1 && stepNumber <= TOTAL_STEPS;
}
