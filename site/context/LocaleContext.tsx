'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { DEFAULT_LOCALE, LANGUAGE_LOCALE_MAP, type Locale } from '@/i18n/config';

interface LocaleContextValue {
  locale: string;
  currency: string;
  language: string;
  localePath: (path: string) => string;
  setLanguage: (language: string) => Promise<void>;
}

const LocaleContext = createContext<LocaleContextValue>({
  locale: DEFAULT_LOCALE.locale,
  currency: DEFAULT_LOCALE.currency,
  language: DEFAULT_LOCALE.language,
  localePath: (path) => `/${DEFAULT_LOCALE.language}${path.startsWith('/') ? path : `/${path}`}`,
  setLanguage: async () => {},
});

export function LocaleProvider({
  children,
  initialLocale,
  initialCurrency,
  initialLanguage,
}: {
  children: ReactNode;
  initialLocale?: string;
  initialCurrency?: string;
  initialLanguage?: string;
}) {
  const router = useRouter();
  const [locale, setLocale] = useState(initialLocale ?? DEFAULT_LOCALE.locale);
  const [currency, setCurrency] = useState(initialCurrency ?? DEFAULT_LOCALE.currency);
  const [language, setLanguageState] = useState(initialLanguage ?? DEFAULT_LOCALE.language);

  const setLanguage = async (newLanguage: string) => {
    const config = LANGUAGE_LOCALE_MAP[newLanguage];
    if (!config) return;

    const newLocale = config.locale;
    const newCurrency = currency; // keep store-assigned currency; only locale changes

    await fetch('/api/session/locale', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ locale: newLanguage, currency: newCurrency }),
    });

    setLocale(newLocale);
    setLanguageState(newLanguage);

    // Navigate to the same path under the new locale prefix
    const currentPath = window.location.pathname;
    const pathWithoutLocale = currentPath.replace(/^\/[a-z]{2}(\/|$)/, '/');
    const newPath = `/${newLanguage}${pathWithoutLocale === '/' ? '' : pathWithoutLocale}`;
    router.push(newPath);
    router.refresh();
  };

  const localePath = (path: string) =>
    `/${language}${path.startsWith('/') ? path : `/${path}`}`;

  return (
    <LocaleContext.Provider value={{ locale, currency, language, localePath, setLanguage }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  return useContext(LocaleContext);
}
