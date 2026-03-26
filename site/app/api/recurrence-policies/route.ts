import { NextResponse } from 'next/server';
import { getRecurrencePolicies } from '@/lib/ct/recurring-orders';
import { getSession } from '@/lib/session';
import { DEFAULT_LOCALE } from '@/i18n/config';

export async function GET() {
  const session = await getSession();
  const locale = session.locale ?? DEFAULT_LOCALE.locale;
  try {
    const policies = await getRecurrencePolicies({ locale });
    return NextResponse.json({ results: policies });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Failed to fetch policies' }, { status: 500 });
  }
}
