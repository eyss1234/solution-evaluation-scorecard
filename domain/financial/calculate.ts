/**
 * Financial calculation logic - pure domain functions
 */

export type CostCategory = 'IMPLEMENTATION_CAPEX' | 'IMPLEMENTATION_OPEX' | 'ONGOING_CAPEX' | 'ONGOING_OPEX';

export interface FinancialEntry {
  id: string;
  name: string;
  category: CostCategory;
  order: number;
  costs: FinancialCost[];
}

export interface FinancialCost {
  id: string;
  entryId: string;
  scorecardRunId: string;
  amount: number;
}

/**
 * Calculate total for a specific section (e.g., all IMPLEMENTATION_CAPEX entries)
 */
export function calculateSectionTotal(
  entries: FinancialEntry[],
  category: CostCategory,
  scorecardRunId: string
): number {
  return entries
    .filter(entry => entry.category === category)
    .reduce((total, entry) => {
      const cost = entry.costs.find(c => c.scorecardRunId === scorecardRunId);
      return total + (cost?.amount || 0);
    }, 0);
}

/**
 * Calculate total for a category type (CapEx or OpEx) within a main section
 */
export function calculateCategoryTotal(
  entries: FinancialEntry[],
  categories: CostCategory[],
  scorecardRunId: string
): number {
  return categories.reduce((total, category) => {
    return total + calculateSectionTotal(entries, category, scorecardRunId);
  }, 0);
}

/**
 * Calculate implementation costs total (both CapEx and OpEx)
 */
export function calculateImplementationTotal(
  entries: FinancialEntry[],
  scorecardRunId: string
): number {
  return calculateCategoryTotal(
    entries,
    ['IMPLEMENTATION_CAPEX', 'IMPLEMENTATION_OPEX'],
    scorecardRunId
  );
}

/**
 * Calculate 3-year ongoing costs total (both CapEx and OpEx)
 */
export function calculateOngoingTotal(
  entries: FinancialEntry[],
  scorecardRunId: string
): number {
  return calculateCategoryTotal(
    entries,
    ['ONGOING_CAPEX', 'ONGOING_OPEX'],
    scorecardRunId
  );
}

/**
 * Calculate grand total across all categories
 */
export function calculateGrandTotal(
  entries: FinancialEntry[],
  scorecardRunId: string
): number {
  return calculateImplementationTotal(entries, scorecardRunId) + 
         calculateOngoingTotal(entries, scorecardRunId);
}

/**
 * Get entries for a specific category, sorted by order
 */
export function getEntriesByCategory(
  entries: FinancialEntry[],
  category: CostCategory
): FinancialEntry[] {
  return entries
    .filter(entry => entry.category === category)
    .sort((a, b) => a.order - b.order);
}
