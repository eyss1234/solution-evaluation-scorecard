/**
 * Currency formatting utilities for financial comparison
 */

export type Currency = 'GBP' | 'USD' | 'EUR';

export function getCurrencySymbol(currency: Currency): string {
  switch (currency) {
    case 'GBP':
      return '£';
    case 'USD':
      return '$';
    case 'EUR':
      return '€';
    default:
      return currency;
  }
}

export function formatCurrency(amount: number, currency: Currency): string {
  const symbol = getCurrencySymbol(currency);
  
  // Format with thousands separator and 2 decimal places
  const formatted = new Intl.NumberFormat('en-GB', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
  
  return `${symbol}${formatted}`;
}

export function parseCurrencyInput(value: string): number {
  // Remove currency symbols, spaces, and commas
  const cleaned = value.replace(/[£$€,\s]/g, '');
  const parsed = parseFloat(cleaned);
  
  return isNaN(parsed) ? 0 : parsed;
}
