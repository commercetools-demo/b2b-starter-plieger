export const locales = ['en', 'de'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';

export const DEFAULT_LOCALE = {
  language: 'en' as Locale,
  locale: 'en-US',
  currency: 'USD',
} as const;

export const LANGUAGE_LOCALE_MAP: Record<string, { locale: string; currency: string }> = {
  en: { locale: 'en-US', currency: 'USD' },
  de: { locale: 'de-DE', currency: 'EUR' },
};
