'use client';

import { useState } from 'react';
import { CurrencySelector } from './CurrencySelector';
import { FinancialEntryRow } from './FinancialEntryRow';
import { formatCurrency, type Currency } from '@/domain/financial/format';
import {
  calculateImplementationTotal,
  calculateOngoingTotal,
  calculateGrandTotal,
  calculateSectionTotal,
  getEntriesByCategory,
  type FinancialEntry,
  type CostCategory,
} from '@/domain/financial/calculate';

interface FinancialComparisonProps {
  projectId: string;
  scorecardRuns: Array<{ id: string; name: string | null; createdAt: Date }>;
  initialEntries: FinancialEntry[];
  initialCurrency: Currency;
}

export function FinancialComparison({
  projectId,
  scorecardRuns,
  initialEntries,
  initialCurrency,
}: FinancialComparisonProps) {
  const [entries, setEntries] = useState<FinancialEntry[]>(initialEntries);
  const [currency, setCurrency] = useState<Currency>(initialCurrency);
  const [newEntryNames, setNewEntryNames] = useState<Record<CostCategory, string>>({
    IMPLEMENTATION_CAPEX: '',
    IMPLEMENTATION_OPEX: '',
    ONGOING_CAPEX: '',
    ONGOING_OPEX: '',
  });
  const [isAdding, setIsAdding] = useState<Record<CostCategory, boolean>>({
    IMPLEMENTATION_CAPEX: false,
    IMPLEMENTATION_OPEX: false,
    ONGOING_CAPEX: false,
    ONGOING_OPEX: false,
  });

  const handleUpdate = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}`);
      const data = await response.json();
      if (data.ok && data.data.financialEntries) {
        setEntries(data.data.financialEntries.map((entry: any) => ({
          ...entry,
          costs: entry.costs.map((cost: any) => ({
            ...cost,
            amount: Number(cost.amount),
          })),
        })));
      }
    } catch (error) {
      console.error('Error refreshing financial data:', error);
    }
  };

  const handleDelete = (entryId: string) => {
    setEntries(prev => prev.filter(e => e.id !== entryId));
  };

  const handleAddEntry = async (category: CostCategory) => {
    const name = newEntryNames[category].trim();
    if (!name) return;

    setIsAdding(prev => ({ ...prev, [category]: true }));
    try {
      const response = await fetch(`/api/projects/${projectId}/financial/entries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, category }),
      });

      if (!response.ok) throw new Error('Failed to create entry');

      const result = await response.json();
      if (result.ok && result.data) {
        // Add the new entry to state immediately
        const newEntry = {
          ...result.data,
          costs: result.data.costs.map((cost: any) => ({
            ...cost,
            amount: Number(cost.amount),
          })),
        };
        setEntries(prev => [...prev, newEntry]);
      }

      setNewEntryNames(prev => ({ ...prev, [category]: '' }));
    } catch (error) {
      console.error('Error creating entry:', error);
      alert('Failed to create entry. Please try again.');
    } finally {
      setIsAdding(prev => ({ ...prev, [category]: false }));
    }
  };

  if (scorecardRuns.length === 0) {
    return (
      <div className="text-center py-8 text-zinc-500">
        <svg className="w-12 h-12 mx-auto mb-3 text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p>Create scorecards to compare financial data</p>
      </div>
    );
  }

  const handleAddCostClick = (category: CostCategory) => {
    setNewEntryNames(prev => ({ ...prev, [category]: '' }));
    setIsAdding(prev => ({ ...prev, [category]: true }));
  };

  const handleCancelAdd = (category: CostCategory) => {
    setNewEntryNames(prev => ({ ...prev, [category]: '' }));
    setIsAdding(prev => ({ ...prev, [category]: false }));
  };

  const handleConfirmAdd = async (category: CostCategory) => {
    const name = newEntryNames[category].trim();
    if (!name) {
      handleCancelAdd(category);
      return;
    }

    try {
      const response = await fetch(`/api/projects/${projectId}/financial/entries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, category }),
      });

      if (!response.ok) throw new Error('Failed to create entry');

      const result = await response.json();
      if (result.ok && result.data) {
        const newEntry = {
          ...result.data,
          costs: result.data.costs.map((cost: any) => ({
            ...cost,
            amount: Number(cost.amount),
          })),
        };
        setEntries(prev => [...prev, newEntry]);
      }

      setNewEntryNames(prev => ({ ...prev, [category]: '' }));
      setIsAdding(prev => ({ ...prev, [category]: false }));
    } catch (error) {
      console.error('Error creating entry:', error);
      alert('Failed to create entry. Please try again.');
      setIsAdding(prev => ({ ...prev, [category]: false }));
    }
  };

  const renderSection = (title: string, category: CostCategory) => {
    const sectionEntries = getEntriesByCategory(entries, category);
    
    return (
      <>
        <tr className="bg-zinc-100">
          <td colSpan={scorecardRuns.length + 1} className="py-2 px-4">
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs font-semibold text-zinc-700 uppercase tracking-wide">
                {title}
              </span>
              <button
                onClick={() => handleAddCostClick(category)}
                disabled={isAdding[category]}
                className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Add Cost"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Cost
              </button>
            </div>
          </td>
        </tr>
        {sectionEntries.map((entry) => (
          <FinancialEntryRow
            key={entry.id}
            entry={entry}
            scorecardRuns={scorecardRuns}
            currency={currency}
            projectId={projectId}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
          />
        ))}
        {isAdding[category] && (
          <tr className="border-b border-zinc-100 bg-indigo-50/30">
            <td className="py-3 px-4 bg-white sticky left-0 z-10">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newEntryNames[category]}
                  onChange={(e) => setNewEntryNames(prev => ({ ...prev, [category]: e.target.value }))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleConfirmAdd(category);
                    if (e.key === 'Escape') handleCancelAdd(category);
                  }}
                  placeholder="Enter cost name..."
                  autoFocus
                  className="flex-1 px-2 py-1 text-sm border border-indigo-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  onClick={() => handleConfirmAdd(category)}
                  className="p-1 text-green-600 hover:text-green-700 hover:bg-green-50 rounded transition-colors"
                  title="Confirm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </button>
                <button
                  onClick={() => handleCancelAdd(category)}
                  className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                  title="Cancel"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </td>
            {scorecardRuns.map((run) => (
              <td key={run.id} className="py-3 px-4"></td>
            ))}
          </tr>
        )}
        <tr className="bg-zinc-50 font-semibold border-b-2 border-zinc-200">
          <td className="py-3 px-4 text-sm text-zinc-900 sticky left-0 z-10 bg-zinc-50">
            {title} Sub-total
          </td>
          {scorecardRuns.map((run) => {
            const total = calculateSectionTotal(entries, category, run.id);
            return (
              <td key={run.id} className="py-3 px-4 text-right text-sm text-zinc-900">
                {formatCurrency(total, currency)}
              </td>
            );
          })}
        </tr>
      </>
    );
  };

  return (
    <div>
      <div className="flex items-center justify-end mb-4">
        <CurrencySelector
          projectId={projectId}
          currentCurrency={currency}
          onCurrencyChange={setCurrency}
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b-2 border-zinc-200">
              <th className="text-left py-3 px-4 font-semibold text-zinc-900 bg-zinc-50 sticky left-0 z-10 min-w-[200px]">
              </th>
              {scorecardRuns.map((run, index) => (
                <th key={run.id} className="text-right py-3 px-4 font-semibold text-zinc-900 bg-zinc-50 min-w-[140px]">
                  <div className="text-sm">{run.name || `Scorecard ${scorecardRuns.length - index}`}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="bg-indigo-100">
              <td colSpan={scorecardRuns.length + 1} className="py-2 px-4 text-sm font-bold text-indigo-900">
                Implementation Costs
              </td>
            </tr>
            {renderSection('Capital Expenditure', 'IMPLEMENTATION_CAPEX')}
            {renderSection('Operational Expenditure', 'IMPLEMENTATION_OPEX')}
            <tr className="bg-indigo-50 font-bold border-y-2 border-indigo-200">
              <td className="py-3 px-4 text-sm text-indigo-900 sticky left-0 z-10 bg-indigo-50">
                Implementation Costs Total
              </td>
              {scorecardRuns.map((run) => {
                const total = calculateImplementationTotal(entries, run.id);
                return (
                  <td key={run.id} className="py-3 px-4 text-right text-sm text-indigo-900">
                    {formatCurrency(total, currency)}
                  </td>
                );
              })}
            </tr>

            <tr className="h-4">
              <td colSpan={scorecardRuns.length + 1}></td>
            </tr>

            <tr className="bg-indigo-100">
              <td colSpan={scorecardRuns.length + 1} className="py-2 px-4 text-sm font-bold text-indigo-900">
                3-Year Ongoing Costs
              </td>
            </tr>
            {renderSection('Capital Expenditure', 'ONGOING_CAPEX')}
            {renderSection('Operational Expenditure', 'ONGOING_OPEX')}
            <tr className="bg-indigo-50 font-bold border-y-2 border-indigo-200">
              <td className="py-3 px-4 text-sm text-indigo-900 sticky left-0 z-10 bg-indigo-50">
                3-Year Ongoing Costs Total
              </td>
              {scorecardRuns.map((run) => {
                const total = calculateOngoingTotal(entries, run.id);
                return (
                  <td key={run.id} className="py-3 px-4 text-right text-sm text-indigo-900">
                    {formatCurrency(total, currency)}
                  </td>
                );
              })}
            </tr>

            <tr className="bg-indigo-600 text-white font-bold border-y-2 border-indigo-700">
              <td className="py-4 px-4 text-base sticky left-0 z-10 bg-indigo-600">
                Grand Total
              </td>
              {scorecardRuns.map((run) => {
                const total = calculateGrandTotal(entries, run.id);
                return (
                  <td key={run.id} className="py-4 px-4 text-right text-base">
                    {formatCurrency(total, currency)}
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
