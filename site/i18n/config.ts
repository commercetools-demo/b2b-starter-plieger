export const locales = ['en-US', 'de-DE'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en-US';

export const DEFAULT_LOCALE = {
  language: 'en-US' as Locale,
  locale: 'en-US',
  country: 'US',
  currency: 'USD',
} as const;

export const LANGUAGE_LOCALE_MAP: Record<string, { locale: string; country: string; currency: string }> = {
  'en-US': { locale: 'en-US', country: 'US', currency: 'USD' },
  'de-DE': { locale: 'de-DE', country: 'DE', currency: 'EUR' },
};
