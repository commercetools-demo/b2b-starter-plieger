import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { getRecurringOrders } from '@/lib/ct/recurring-orders';
import type { RecurringOrderState } from '@/lib/types';

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session?.customerId || !session.businessUnitKey) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const limit = searchParams.get('limit') ? Number(searchParams.get('limit')) : 20;
  const offset = searchParams.get('offset') ? Number(searchParams.get('offset')) : 0;
  const statesParam = searchParams.get('states');
  const states = statesParam
    ? (statesParam.split(',') as RecurringOrderState[])
    : undefined;

  try {
    const result = await getRecurringOrders(session.customerId, session.businessUnitKey, { limit, offset, states });
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Failed to fetch recurring orders' }, { status: 500 });
  }
}
