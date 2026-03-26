'use client';

import { useLocale } from '@/context/LocaleContext';
import {
  formatMoney as _formatMoney,
  localizedString as _localizedString,
  formatDate as _formatDate,
  formatDateTime as _formatDateTime,
} from '@/lib/utils';
import type { Money } from '@/lib/types';

export function useFormatters() {
  const { locale } = useLocale();

  return {
    formatMoney: (money: Money | undefined) => _formatMoney(money, locale),
    localizedString: (value: Record<string, string> | string | undefined) =>
      _localizedString(value, locale),
    formatDate: (dateString: string, options?: Intl.DateTimeFormatOptions) =>
      _formatDate(dateString, locale, options),
    formatDateTime: (dateString: string, options?: Intl.DateTimeFormatOptions) =>
      _formatDateTime(dateString, locale, options),
  };
}
