import type { Metadata } from 'next';
import './globals.css';
import { ToastProvider } from '@/context/ToastContext';
import { AuthProvider } from '@/context/AuthContext';
import { BusinessUnitProvider } from '@/context/BusinessUnitContext';
import { CartProvider } from '@/context/CartContext';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'Atlas Construction Equipment | B2B Commerce',
  description: 'Heavy equipment procurement powered by commercetools',
  icons: {
    icon: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col bg-surface font-sans text-gray-900 antialiased">
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
      </body>
    </html>
  );
}
