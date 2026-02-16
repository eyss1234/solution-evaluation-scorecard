export interface StepDefinition {
  number: number;
  name: string;
  description: string;
  sectionWeight: number;
  questionsPerStep: number;
}

export const STEPS: StepDefinition[] = [
  {
    number: 1,
    name: 'Business & Functional Fit',
    description: 'Section Weight: 30%',
    sectionWeight: 30,
    questionsPerStep: 3,
  },
  {
    number: 2,
    name: 'Technical & Architectural Fit',
    description: 'Section Weight: 20%',
    sectionWeight: 20,
    questionsPerStep: 7,
  },
  {
    number: 3,
    name: 'Vendor & Roadmap Assessment',
    description: 'Section Weight: 10%',
    sectionWeight: 10,
    questionsPerStep: 4,
  },
  {
    number: 4,
    name: 'Delivery Feasibility',
    description: 'Section Weight: 15%',
    sectionWeight: 15,
    questionsPerStep: 4,
  },
  {
    number: 5,
    name: 'User Experience & Adoption',
    description: 'Section Weight: 10%',
    sectionWeight: 10,
    questionsPerStep: 3,
  },
  {
    number: 6,
    name: 'Commercials & Total Cost of Ownership',
    description: 'Section Weight: 15%',
    sectionWeight: 15,
    questionsPerStep: 3,
  },
  {
    number: 7,
    name: 'Overview',
    description: 'Optional summary of pros, cons, and overall assessment',
    sectionWeight: 0,
    questionsPerStep: 0,
  },
];

export const TOTAL_STEPS = STEPS.length;

export function getStep(stepNumber: number): StepDefinition | undefined {
  return STEPS.find((s) => s.number === stepNumber);
}

export function isValidStep(stepNumber: number): boolean {
  return stepNumber >= 1 && stepNumber <= TOTAL_STEPS;
}
