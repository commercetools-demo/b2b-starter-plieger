export const locales = ['en-US', 'de-DE', 'nl-NL'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en-US';

export const DEFAULT_LOCALE = {
  language: 'nl-NL' as Locale,
  locale: 'nl-NL',
  country: 'NL',
  currency: 'EUR',
} as const;

export const LANGUAGE_LOCALE_MAP: Record<string, { locale: string; country: string; currency: string }> = {
  'en-US': { locale: 'en-US', country: 'US', currency: 'USD' },
  'de-DE': { locale: 'de-DE', country: 'DE', currency: 'EUR' },
  'nl-NL': { locale: 'nl-NL', country: 'NL', currency: 'EUR' },
};
