import type { Money } from './types';

export function formatMoney(money: Money | undefined): string {
  if (!money) return '$0.00';
  const amount = money.centAmount / Math.pow(10, money.fractionDigits ?? 2);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: money.currencyCode,
  }).format(amount);
}

export function localizedString(
  value: Record<string, string> | string | undefined,
  locale = 'en-US'
): string {
  if (!value) return '';
  if (typeof value === 'string') return value;
  return value[locale] || value['en-US'] || value['en'] || Object.values(value)[0] || '';
}

export function classNames(...classes: (string | false | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}
