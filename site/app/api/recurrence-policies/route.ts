import { NextResponse } from 'next/server';
import { getRecurrencePolicies } from '@/lib/ct/recurring-orders';

export async function GET() {
  try {
    const policies = await getRecurrencePolicies();
    return NextResponse.json({ results: policies });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Failed to fetch policies' }, { status: 500 });
  }
}
