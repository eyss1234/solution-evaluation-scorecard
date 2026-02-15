'use client';

import { useState } from 'react';
import { FinancialEntryRow } from './FinancialEntryRow';
import { formatCurrency, type Currency } from '@/domain/financial/format';
import { calculateSectionTotal, getEntriesByCategory, type FinancialEntry, type CostCategory } from '@/domain/financial/calculate';

interface FinancialSectionProps {
  title: string;
  category: CostCategory;
  entries: FinancialEntry[];
  scorecardRuns: Array<{ id: string; name: string | null }>;
  currency: Currency;
  projectId: string;
  onUpdate: () => void;
  onDelete: (entryId: string) => void;
}

export function FinancialSection({
  title,
  category,
  entries,
  scorecardRuns,
  currency,
  projectId,
  onUpdate,
  onDelete,
}: FinancialSectionProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newEntryName, setNewEntryName] = useState('');

  const sectionEntries = getEntriesByCategory(entries, category);

  const handleAddEntry = async () => {
    if (!newEntryName.trim()) return;

    setIsAdding(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/financial/entries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newEntryName, category }),
      });

      if (!response.ok) throw new Error('Failed to create entry');

      setNewEntryName('');
      onUpdate();
    } catch (error) {
      console.error('Error creating entry:', error);
      alert('Failed to create entry. Please try again.');
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="mb-6">
      <h4 className="text-sm font-semibold text-zinc-700 mb-2 px-4">{title}</h4>
      <table className="w-full border-collapse">
        <tbody>
          {sectionEntries.map((entry) => (
            <FinancialEntryRow
              key={entry.id}
              entry={entry}
              scorecardRuns={scorecardRuns}
              currency={currency}
              projectId={projectId}
              onUpdate={onUpdate}
              onDelete={onDelete}
            />
          ))}
          <tr className="border-b border-zinc-100">
            <td className="py-3 px-4 bg-white sticky left-0 z-10">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newEntryName}
                  onChange={(e) => setNewEntryName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddEntry();
                    if (e.key === 'Escape') setNewEntryName('');
                  }}
                  placeholder="Add new entry..."
                  disabled={isAdding}
                  className="flex-1 px-2 py-1 text-sm border border-zinc-200 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                />
                <button
                  onClick={handleAddEntry}
                  disabled={isAdding || !newEntryName.trim()}
                  className="px-3 py-1 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add
                </button>
              </div>
            </td>
            {scorecardRuns.map((run) => (
              <td key={run.id} className="py-3 px-4"></td>
            ))}
          </tr>
          <tr className="bg-zinc-50 font-semibold border-b-2 border-zinc-200">
            <td className="py-3 px-4 text-sm text-zinc-900 sticky left-0 z-10 bg-zinc-50">
              {title} Sub-total
            </td>
            {scorecardRuns.map((run) => {
              const total = calculateSectionTotal(entries, category, run.id);
              return (
                <td key={run.id} className="py-3 px-4 text-center text-sm text-zinc-900">
                  {formatCurrency(total, currency)}
                </td>
              );
            })}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
