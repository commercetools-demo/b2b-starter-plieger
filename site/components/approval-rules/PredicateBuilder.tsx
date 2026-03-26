'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';

export interface PredicateCondition {
  field: string;
  operator: string;
  value: string;
  currency?: string;
}

const fieldOptions = [
  { value: 'totalPrice', label: 'Order Total', description: 'The total price of the order' },
  { value: 'lineItemCount', label: 'Number of Line Items', description: 'How many line items are in the order' },
  { value: 'currency', label: 'Currency', description: 'The currency of the order' },
];

const numericOperators = [
  { value: '>', label: 'is greater than' },
  { value: '>=', label: 'is greater than or equal to' },
  { value: '<', label: 'is less than' },
  { value: '<=', label: 'is less than or equal to' },
  { value: '=', label: 'is equal to' },
];

const currencySymbolMap: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
};

/**
 * Format a raw numeric string as currency display (e.g. "5000" → "5,000.00")
 */
function formatCurrencyDisplay(raw: string): string {
  // Strip everything except digits and decimal
  const cleaned = raw.replace(/[^0-9.]/g, '');
  if (!cleaned) return '';

  const parts = cleaned.split('.');
  const intPart = parts[0] || '0';
  const decPart = (parts[1] ?? '').slice(0, 2);

  // Add commas to integer part
  const withCommas = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  if (parts.length > 1) {
    return `${withCommas}.${decPart}`;
  }
  return withCommas;
}

/**
 * Strip formatting to get the raw numeric value for storage
 */
function stripCurrencyFormat(display: string): string {
  return display.replace(/,/g, '');
}

/**
 * Format a raw value with 2 decimal places for display (on blur)
 */
function formatWithDecimals(raw: string): string {
  const num = parseFloat(raw.replace(/,/g, ''));
  if (isNaN(num)) return raw;
  const fixed = num.toFixed(2);
  const parts = fixed.split('.');
  const intPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `${intPart}.${parts[1]}`;
}

/**
 * Parse a commercetools order predicate string back into structured conditions.
 */
export function parsePredicate(predicate: string): PredicateCondition[] {
  if (!predicate || !predicate.trim()) {
    return [{ field: 'totalPrice', operator: '>', currency: 'USD', value: '' }];
  }

  const parts = predicate.split(/\s+and\s+/i);
  const conditions: PredicateCondition[] = [];

  for (const part of parts) {
    const trimmed = part.trim();

    // Match: totalPrice.centAmount <op> <number> (with or without order. prefix)
    const priceMatch = trimmed.match(
      /(?:order\.)?totalPrice\.centAmount\s*(>=|<=|>|<|=)\s*(\d+)/
    );
    if (priceMatch) {
      const centAmount = parseInt(priceMatch[2], 10);
      const dollars = (centAmount / 100).toFixed(2);
      conditions.push({
        field: 'totalPrice',
        operator: priceMatch[1],
        currency: 'USD',
        value: dollars,
      });
      continue;
    }

    // Match: lineItemCount <op> <number>
    const lineItemMatch = trimmed.match(
      /(?:order\.)?lineItemCount\s*(>=|<=|>|<|=)\s*(\d+)/
    );
    if (lineItemMatch) {
      conditions.push({
        field: 'lineItemCount',
        operator: lineItemMatch[1],
        value: lineItemMatch[2],
      });
      continue;
    }

    // Match: totalPrice.currencyCode = "USD"
    const currencyMatch = trimmed.match(
      /(?:order\.)?totalPrice\.currencyCode\s*=\s*"([A-Z]+)"/
    );
    if (currencyMatch) {
      conditions.push({
        field: 'currency',
        operator: '=',
        value: currencyMatch[1],
      });
      continue;
    }
  }

  if (conditions.length === 0) {
    return [{ field: 'totalPrice', operator: '>', currency: 'USD', value: '' }];
  }

  return conditions;
}

/**
 * Build a commercetools predicate string from structured conditions.
 */
export function buildPredicateString(conditions: PredicateCondition[]): string {
  const parts = conditions
    .filter((c) => c.value !== '')
    .map((c) => {
      if (c.field === 'totalPrice') {
        const rawValue = c.value.replace(/,/g, '');
        const centAmount = Math.round(parseFloat(rawValue) * 100);
        if (isNaN(centAmount)) return '';
        return `totalPrice.centAmount ${c.operator} ${centAmount}`;
      }
      if (c.field === 'lineItemCount') {
        return `lineItemCount ${c.operator} ${c.value}`;
      }
      if (c.field === 'currency') {
        return `totalPrice.currencyCode = "${c.value}"`;
      }
      return '';
    })
    .filter(Boolean);
  return parts.join(' and ') || 'totalPrice.centAmount > 0';
}

interface PredicateBuilderProps {
  conditions: PredicateCondition[];
  onChange: (conditions: PredicateCondition[]) => void;
}

/**
 * A currency input that formats as the user types (with commas) and adds .00 on blur.
 */
function CurrencyInput({
  value,
  currencySymbol,
  onChange,
}: {
  value: string;
  currencySymbol: string;
  onChange: (raw: string) => void;
}) {
  const [displayValue, setDisplayValue] = useState(() => {
    if (!value) return '';
    return formatCurrencyDisplay(value);
  });
  const [isFocused, setIsFocused] = useState(false);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const input = e.target.value;
      const formatted = formatCurrencyDisplay(input);
      setDisplayValue(formatted);
      onChange(stripCurrencyFormat(formatted));
    },
    [onChange]
  );

  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    const raw = stripCurrencyFormat(displayValue);
    if (raw) {
      const formatted = formatWithDecimals(raw);
      setDisplayValue(formatted);
      // Store the raw number with decimals (no commas)
      const num = parseFloat(raw);
      if (!isNaN(num)) {
        onChange(num.toFixed(2));
      }
    }
  }, [displayValue, onChange]);

  // Sync from parent only when not focused (e.g. field type changed)
  if (!isFocused && value) {
    const rawDisplay = stripCurrencyFormat(displayValue);
    const rawValue = value.replace(/,/g, '');
    if (rawDisplay !== rawValue && parseFloat(rawDisplay) !== parseFloat(rawValue)) {
      const newDisplay = formatCurrencyDisplay(value);
      if (newDisplay !== displayValue) {
        setDisplayValue(newDisplay);
      }
    }
  }

  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">
        {currencySymbol}
      </span>
      <input
        type="text"
        inputMode="decimal"
        value={displayValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder="1,000.00"
        className="block w-full rounded-md border border-gray-300 bg-white pl-7 pr-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
    </div>
  );
}

export function PredicateBuilder({ conditions, onChange }: PredicateBuilderProps) {
  const t = useTranslations('predicateBuilder');

  const currencyOptions = [
    { value: 'USD', label: t('currencyUSD'), symbol: '$' },
    { value: 'EUR', label: t('currencyEUR'), symbol: '€' },
    { value: 'GBP', label: t('currencyGBP'), symbol: '£' },
  ];

  const updateCondition = (index: number, updates: Partial<PredicateCondition>) => {
    const updated = conditions.map((c, i) => (i === index ? { ...c, ...updates } : c));
    onChange(updated);
  };

  const addCondition = () => {
    onChange([...conditions, { field: 'totalPrice', operator: '>', currency: 'USD', value: '' }]);
  };

  const removeCondition = (index: number) => {
    if (conditions.length <= 1) return;
    onChange(conditions.filter((_, i) => i !== index));
  };

  const handleFieldChange = (index: number, field: string) => {
    if (field === 'currency') {
      updateCondition(index, { field, operator: '=', value: 'USD', currency: undefined });
    } else if (field === 'lineItemCount') {
      updateCondition(index, { field, operator: '>', value: '', currency: undefined });
    } else {
      updateCondition(index, { field, operator: '>', currency: 'USD', value: '' });
    }
  };

  return (
    <div className="space-y-3">
      {conditions.map((condition, index) => (
        <div key={index}>
          {index > 0 && (
            <div className="flex items-center gap-2 my-2">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="inline-flex items-center rounded-full bg-amber-50 border border-amber-200 px-3 py-0.5 text-xs font-semibold text-amber-700 uppercase">
                AND
              </span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>
          )}
          <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-4">
            <div className="flex flex-wrap items-end gap-3">
              {/* Field selector */}
              <div className="min-w-[170px]">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  When
                </label>
                <select
                  value={condition.field}
                  onChange={(e) => handleFieldChange(index, e.target.value)}
                  className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {fieldOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* === Total Price field === */}
              {condition.field === 'totalPrice' && (
                <>
                  <div className="min-w-[180px]">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                      Condition
                    </label>
                    <select
                      value={condition.operator}
                      onChange={(e) => updateCondition(index, { operator: e.target.value })}
                      className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      {numericOperators.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="w-[110px]">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                      Currency
                    </label>
                    <select
                      value={condition.currency ?? 'USD'}
                      onChange={(e) => updateCondition(index, { currency: e.target.value })}
                      className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      {currencyOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1 min-w-[120px]">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                      Amount
                    </label>
                    <CurrencyInput
                      value={condition.value}
                      currencySymbol={currencySymbolMap[condition.currency ?? 'USD'] ?? '$'}
                      onChange={(raw) => updateCondition(index, { value: raw })}
                    />
                  </div>
                </>
              )}

              {/* === Line Item Count field === */}
              {condition.field === 'lineItemCount' && (
                <>
                  <div className="min-w-[180px]">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                      Condition
                    </label>
                    <select
                      value={condition.operator}
                      onChange={(e) => updateCondition(index, { operator: e.target.value })}
                      className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      {numericOperators.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1 min-w-[100px]">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                      Count
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={condition.value}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, '');
                        updateCondition(index, { value: val });
                      }}
                      placeholder="5"
                      className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </>
              )}

              {/* === Currency field === */}
              {condition.field === 'currency' && (
                <div className="min-w-[160px]">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    Is
                  </label>
                  <select
                    value={condition.value}
                    onChange={(e) => updateCondition(index, { value: e.target.value })}
                    className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    {currencyOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Remove button */}
              {conditions.length > 1 && (
                <button
                  onClick={() => removeCondition(index)}
                  className="mb-0.5 rounded-md p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors flex-shrink-0"
                  aria-label="Remove condition"
                  title="Remove this condition"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      ))}

      <button
        onClick={addCondition}
        className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 mt-2 rounded-md px-2 py-1.5 hover:bg-blue-50 transition-colors"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Add Condition
      </button>

      {/* Live predicate preview */}
      <div className="mt-4 rounded-md bg-slate-50 border border-slate-200 px-3 py-2">
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Generated Predicate</p>
        <code className="text-xs text-slate-600 break-all">
          {buildPredicateString(conditions)}
        </code>
      </div>
    </div>
  );
}
