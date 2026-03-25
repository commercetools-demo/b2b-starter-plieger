import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { duplicateRecurringOrder } from '@/lib/ct/recurring-orders';

interface Params { params: Promise<{ id: string }> }

export async function POST(_req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session?.customerId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  try {
    const newOrder = await duplicateRecurringOrder(id);
    return NextResponse.json(newOrder, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Failed to duplicate' }, { status: 500 });
  }
}
