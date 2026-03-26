import { headers } from 'next/headers';
import { defaultTokens, tokensToCSSVars } from '@/lib/theme/tokens';
import './globals.css';

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers();
  const lang = headersList.get('x-locale') ?? 'en';

  return (
    <html lang={lang}>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <style>{`:root { ${tokensToCSSVars(defaultTokens)} }`}</style>
      </head>
      <body className="min-h-screen flex flex-col bg-surface font-sans text-gray-900 antialiased">
        {children}
      </body>
    </html>
  );
}
