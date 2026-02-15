'use client';

import { useState, useEffect, useRef } from 'react';
import { formatCurrency, parseCurrencyInput, type Currency } from '@/domain/financial/format';
import type { FinancialEntry } from '@/domain/financial/calculate';
import { ConfirmModal } from './ConfirmModal';

interface FinancialEntryRowProps {
  entry: FinancialEntry;
  scorecardRuns: Array<{ id: string; name: string | null }>;
  currency: Currency;
  projectId: string;
  onUpdate: () => void;
  onDelete: (entryId: string) => void;
}

export function FinancialEntryRow({
  entry,
  scorecardRuns,
  currency,
  projectId,
  onUpdate,
  onDelete,
}: FinancialEntryRowProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [name, setName] = useState(entry.name);
  const [costs, setCosts] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    entry.costs.forEach(cost => {
      initial[cost.scorecardRunId] = Number(cost.amount);
    });
    return initial;
  });
  const [inputValues, setInputValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    entry.costs.forEach(cost => {
      const amount = Number(cost.amount);
      initial[cost.scorecardRunId] = amount === 0 ? '' : amount.toString();
    });
    return initial;
  });
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const handleNameBlur = async () => {
    setIsEditingName(false);
    if (name !== entry.name && name.trim()) {
      try {
        const response = await fetch(`/api/projects/${projectId}/financial/entries/${entry.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name }),
        });

        if (!response.ok) throw new Error('Failed to update entry name');
        onUpdate();
      } catch (error) {
        console.error('Error updating entry name:', error);
        setName(entry.name);
      }
    } else {
      setName(entry.name);
    }
  };

  const handleCostChange = (scorecardRunId: string, value: string) => {
    // Allow empty string or valid number patterns (including partial like "12." or "12.5")
    if (value !== '' && !/^\d*\.?\d*$/.test(value)) {
      return; // Reject invalid input
    }
    
    // Update the input value immediately for responsive typing
    setInputValues(prev => ({ ...prev, [scorecardRunId]: value }));
    
    // Parse and update the numeric value
    const numericValue = parseCurrencyInput(value);
    
    setCosts(prev => {
      const updatedCosts = { ...prev, [scorecardRunId]: numericValue };
      
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(() => {
        saveCosts(updatedCosts);
      }, 500);
      
      return updatedCosts;
    });
  };

  const saveCosts = async (costsToSave: Record<string, number>) => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/financial/entries/${entry.id}/costs`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ costs: costsToSave }),
      });

      if (!response.ok) throw new Error('Failed to save costs');
      onUpdate();
    } catch (error) {
      console.error('Error saving costs:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/financial/entries/${entry.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete entry');
      onDelete(entry.id);
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Error deleting entry:', error);
      alert('Failed to delete entry. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return (
    <tr className="border-b border-zinc-100 hover:bg-zinc-50/50 group">
      <td className="py-3 px-4 bg-white sticky left-0 z-10">
        <div className="flex items-center gap-2">
          {isEditingName ? (
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={handleNameBlur}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleNameBlur();
                if (e.key === 'Escape') {
                  setName(entry.name);
                  setIsEditingName(false);
                }
              }}
              autoFocus
              className="flex-1 px-2 py-1 text-sm border border-indigo-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          ) : (
            <button
              onClick={() => setIsEditingName(true)}
              className="flex-1 text-left text-sm text-zinc-900 hover:text-indigo-600"
            >
              {entry.name}
            </button>
          )}
          <button
            onClick={handleDeleteClick}
            className="opacity-0 group-hover:opacity-100 p-1 text-zinc-400 hover:text-red-600 transition-opacity"
            title="Delete entry"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </td>
      {scorecardRuns.map((run) => {
        const inputValue = inputValues[run.id] || '';
        return (
          <td key={run.id} className="py-3 px-4 text-center">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => handleCostChange(run.id, e.target.value)}
              placeholder="0.00"
              className="w-full px-2 py-1 text-sm text-right border border-zinc-200 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </td>
        );
      })}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Delete Cost Entry"
        message={`Are you sure you want to delete "${entry.name}"? This action cannot be undone.`}
        confirmText="Delete"
        confirmStyle="danger"
        isLoading={isDeleting}
      />
    </tr>
  );
}
