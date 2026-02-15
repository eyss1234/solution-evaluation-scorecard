'use client';

import { useState } from 'react';
import { getCurrencySymbol, type Currency } from '@/domain/financial/format';

interface CurrencySelectorProps {
  projectId: string;
  currentCurrency: Currency;
  onCurrencyChange: (currency: Currency) => void;
}

export function CurrencySelector({ projectId, currentCurrency, onCurrencyChange }: CurrencySelectorProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCurrency = e.target.value as Currency;
    setIsUpdating(true);

    try {
      const response = await fetch(`/api/projects/${projectId}/financial/currency`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currency: newCurrency }),
      });

      if (!response.ok) {
        throw new Error('Failed to update currency');
      }

      onCurrencyChange(newCurrency);
    } catch (error) {
      console.error('Error updating currency:', error);
      alert('Failed to update currency. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="currency-select" className="text-sm font-medium text-zinc-700">
        Currency:
      </label>
      <select
        id="currency-select"
        value={currentCurrency}
        onChange={handleChange}
        disabled={isUpdating}
        className="px-3 py-1.5 border border-zinc-300 rounded-lg text-sm font-medium text-zinc-900 bg-white hover:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <option value="GBP">{getCurrencySymbol('GBP')} GBP</option>
        <option value="USD">{getCurrencySymbol('USD')} USD</option>
        <option value="EUR">{getCurrencySymbol('EUR')} EUR</option>
      </select>
    </div>
  );
}
