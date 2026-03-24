import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { getRecurringOrderById } from '@/lib/ct/recurring-orders';

interface Params { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session?.customerId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  try {
    const order = await getRecurringOrderById(id);
    return NextResponse.json(order);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Not found' }, { status: 404 });
  }
}
