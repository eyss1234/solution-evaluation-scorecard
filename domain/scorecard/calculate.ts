/**
 * Scorecard calculation logic - pure domain functions
 * No framework dependencies
 */

export interface QuestionScore {
  questionId: string;
  stepNumber: number;
  weight: number;
  value: number; // 0-5
}

export interface SectionScore {
  stepNumber: number;
  sectionWeight: number; // e.g., 30 for 30%
  weightedScore: number; // 0-100
  rawAverage: number; // 0-5
  questionCount: number;
}

export interface OverallScore {
  totalWeightedScore: number; // 0-100
  sectionScores: SectionScore[];
}

/**
 * Calculate weighted score for a single section
 * 
 * Formula:
 * 1. For each question: (score / 5) * question_weight
 * 2. Sum all weighted scores in section
 * 3. Divide by sum of all question weights in section
 * 4. Multiply by 100 to get percentage (0-100)
 */
export function calculateSectionScore(
  scores: QuestionScore[],
  sectionWeight: number
): SectionScore {
  if (scores.length === 0) {
    return {
      stepNumber: 0,
      sectionWeight,
      weightedScore: 0,
      rawAverage: 0,
      questionCount: 0,
    };
  }

  const stepNumber = scores[0].stepNumber;
  
  // Calculate weighted average within the section
  let totalWeightedScore = 0;
  let totalWeight = 0;
  
  for (const score of scores) {
    // Normalize score to 0-1 range, then multiply by question weight
    const normalizedScore = score.value / 5;
    totalWeightedScore += normalizedScore * score.weight;
    totalWeight += score.weight;
  }
  
  // Section score as percentage (0-100)
  const sectionPercentage = totalWeight > 0 ? (totalWeightedScore / totalWeight) * 100 : 0;
  
  // Raw average for display (0-5)
  const rawAverage = scores.reduce((sum, s) => sum + s.value, 0) / scores.length;

  return {
    stepNumber,
    sectionWeight,
    weightedScore: sectionPercentage,
    rawAverage,
    questionCount: scores.length,
  };
}

/**
 * Calculate overall weighted score across all sections
 * 
 * Formula:
 * 1. Calculate weighted score for each section (0-100)
 * 2. Multiply each section score by its section weight
 * 3. Sum all weighted section scores
 * 4. Result is overall score (0-100)
 */
export function calculateOverallScore(
  scores: QuestionScore[],
  sectionWeights: Map<number, number> // stepNumber -> weight percentage
): OverallScore {
  // Group scores by section
  const scoresBySection = new Map<number, QuestionScore[]>();
  
  for (const score of scores) {
    if (!scoresBySection.has(score.stepNumber)) {
      scoresBySection.set(score.stepNumber, []);
    }
    scoresBySection.get(score.stepNumber)!.push(score);
  }
  
  // Calculate each section's weighted score
  const sectionScores: SectionScore[] = [];
  let totalWeightedScore = 0;
  let totalSectionWeight = 0;
  
  for (const [stepNumber, sectionScores_] of scoresBySection) {
    const sectionWeight = sectionWeights.get(stepNumber) || 0;
    const sectionScore = calculateSectionScore(sectionScores_, sectionWeight);
    
    sectionScores.push(sectionScore);
    
    // Contribute to overall score: section_score * (section_weight / 100)
    totalWeightedScore += sectionScore.weightedScore * (sectionWeight / 100);
    totalSectionWeight += sectionWeight;
  }
  
  return {
    totalWeightedScore,
    sectionScores,
  };
}

/**
 * Format score for display
 */
export function formatScore(score: number, decimals: number = 1): string {
  return score.toFixed(decimals);
}
