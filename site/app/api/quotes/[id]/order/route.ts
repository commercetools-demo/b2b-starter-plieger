import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { createOrderFromQuote } from '@/lib/ct/orders';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session?.customerId || !session.businessUnitKey) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const { id } = await params;
  const { version } = await request.json();

  try {
    const order = await createOrderFromQuote(
      id,
      version,
      session.customerId,
      session.businessUnitKey,
    );
    return NextResponse.json({ order }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.body?.message ?? err?.message ?? 'Failed to create order from quote' },
      { status: 500 }
    );
  }
}
