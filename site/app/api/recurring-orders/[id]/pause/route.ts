import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { updateRecurringOrderState } from '@/lib/ct/recurring-orders';

interface Params { params: Promise<{ id: string }> }

export async function POST(_req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session?.customerId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const updated = await updateRecurringOrderState(id, 'Paused');
    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Failed to pause' }, { status: 500 });
  }
}
