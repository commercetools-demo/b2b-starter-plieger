'use client';

import { locales } from '@/i18n/config';
import { useLocale } from '@/context/LocaleContext';

const LOCALE_LABELS: Record<string, string> = {
  'en-US': 'EN',
  'de-DE': 'DE',
};

export function LanguageSelector() {
  const { language, setLanguage } = useLocale();

  if (locales.length <= 1) return null;

  return (
    <div className="flex items-center gap-1">
      {locales.map((locale) => (
        <button
          key={locale}
          onClick={() => setLanguage(locale)}
          className={`text-xs px-2 py-1 rounded font-medium transition-colors ${
            language === locale
              ? 'bg-red-600 text-white'
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
          }`}
        >
          {LOCALE_LABELS[locale] ?? locale.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
