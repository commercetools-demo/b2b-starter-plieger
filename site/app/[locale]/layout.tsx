import type { Metadata } from 'next';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { NextIntlClientProvider } from 'next-intl';
import { ToastProvider } from '@/context/ToastContext';
import { AuthProvider } from '@/context/AuthContext';
import { BusinessUnitProvider } from '@/context/BusinessUnitContext';
import { CartProvider } from '@/context/CartContext';
import { LocaleProvider } from '@/context/LocaleContext';
import { SessionProvider } from '@/lib/providers/SessionProvider';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { getSession } from '@/lib/session';
import { locales, LANGUAGE_LOCALE_MAP, DEFAULT_LOCALE } from '@/i18n/config';

export const metadata: Metadata = {
  title: 'Plieger | B2B Commerce',
  description: 'B2B Procurement powered by commercetools',
  icons: {
    icon: '/logo.png',
  },
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: language } = await params;
  setRequestLocale(language);
  const [messages, session] = await Promise.all([getMessages(), getSession()]);

  const config = LANGUAGE_LOCALE_MAP[language] ?? LANGUAGE_LOCALE_MAP[DEFAULT_LOCALE.language];
  const fullLocale = config.locale;
  const currency = session.currency ?? config.currency;

  return (
    <SessionProvider>
      <NextIntlClientProvider messages={messages}>
        <LocaleProvider
          initialLocale={fullLocale}
          initialCurrency={currency}
          initialLanguage={language}
        >
          <ToastProvider>
            <AuthProvider>
              <BusinessUnitProvider>
                <CartProvider>
                  <Header />
                  <main className="flex-1">{children}</main>
                  <Footer />
                </CartProvider>
              </BusinessUnitProvider>
            </AuthProvider>
          </ToastProvider>
        </LocaleProvider>
      </NextIntlClientProvider>
    </SessionProvider>
  );
}
