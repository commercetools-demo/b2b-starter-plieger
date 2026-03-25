import type { Metadata } from 'next';
import { getMessages } from 'next-intl/server';
import { NextIntlClientProvider } from 'next-intl';
import './globals.css';
import { ToastProvider } from '@/context/ToastContext';
import { AuthProvider } from '@/context/AuthContext';
import { BusinessUnitProvider } from '@/context/BusinessUnitContext';
import { CartProvider } from '@/context/CartContext';
import { SessionProvider } from '@/lib/providers/SessionProvider';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { defaultTokens, tokensToCSSVars } from '@/lib/theme/tokens';

export const metadata: Metadata = {
  title: 'Atlas Construction Equipment | B2B Commerce',
  description: 'Heavy equipment procurement powered by commercetools',
  icons: {
    icon: '/logo.png',
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const messages = await getMessages();

  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <style>{`:root { ${tokensToCSSVars(defaultTokens)} }`}</style>
      </head>
      <body className="min-h-screen flex flex-col bg-surface font-sans text-gray-900 antialiased">
        <SessionProvider>
          <NextIntlClientProvider messages={messages}>
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
          </NextIntlClientProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
