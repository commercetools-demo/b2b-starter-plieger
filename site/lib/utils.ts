import type { Money } from './types';
import { DEFAULT_LOCALE } from '@/i18n/config';

export function formatMoney(money: Money | undefined, locale?: string): string {
  if (!money) return new Intl.NumberFormat(locale ?? DEFAULT_LOCALE.locale, { style: 'currency', currency: DEFAULT_LOCALE.currency }).format(0);
  const amount = money.centAmount / Math.pow(10, money.fractionDigits ?? 2);
  return new Intl.NumberFormat(locale ?? DEFAULT_LOCALE.locale, {
    style: 'currency',
    currency: money.currencyCode,
  }).format(amount);
}

export function localizedString(
  value: Record<string, string> | string | undefined,
  locale?: string
): string {
  if (!value) return '';
  if (typeof value === 'string') return value;
  const l = locale ?? DEFAULT_LOCALE.locale;
  return value[l] || value[DEFAULT_LOCALE.locale] || value['en-US'] || value['en'] || Object.values(value)[0] || '';
}

export function classNames(...classes: (string | false | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function formatDate(
  dateString: string,
  locale?: string,
  options?: Intl.DateTimeFormatOptions
): string {
  const opts = options ?? { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(locale ?? DEFAULT_LOCALE.locale, opts);
}

export function formatDateTime(
  dateString: string,
  locale?: string,
  options?: Intl.DateTimeFormatOptions
): string {
  const opts = options ?? {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  };
  return new Date(dateString).toLocaleString(locale ?? DEFAULT_LOCALE.locale, opts);
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}
