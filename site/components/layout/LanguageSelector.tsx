'use client';

import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/providers/SessionProvider';
import { locales } from '@/i18n/config';

const LOCALE_LABELS: Record<string, string> = {
  en: 'EN',
  de: 'DE',
};

export function LanguageSelector() {
  const router = useRouter();
  const { session, refetch } = useSession();
  const currentLocale = session.locale ?? 'en';

  if (locales.length <= 1) return null;

  const handleChange = async (locale: string) => {
    await fetch('/api/session/locale', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ locale }),
    });
    refetch();
    router.refresh();
  };

  return (
    <div className="flex items-center gap-1">
      {locales.map((locale) => (
        <button
          key={locale}
          onClick={() => handleChange(locale)}
          className={`text-xs px-2 py-1 rounded font-medium transition-colors ${
            currentLocale === locale
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
