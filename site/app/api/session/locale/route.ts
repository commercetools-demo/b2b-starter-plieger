import { NextRequest, NextResponse } from 'next/server';
import { getSession, setSession } from '@/lib/session';
import { locales } from '@/i18n/config';

export async function POST(request: NextRequest) {
  const { locale, currency } = await request.json();

  const validLocale = (locales as readonly string[]).includes(locale) ? locale : undefined;
  const session = await getSession();
  const updated = { ...session };
  if (validLocale) updated.locale = validLocale;
  if (currency) updated.currency = currency;

  const response = NextResponse.json({ success: true });
  await setSession(response, updated);
  return response;
}
