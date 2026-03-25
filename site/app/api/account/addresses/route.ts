import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { apiRoot } from '@/lib/ct/client';

async function getCustomer(customerId: string) {
  const res = await apiRoot.customers().withId({ ID: customerId }).get().execute();
  return res.body;
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session.customerId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { address } = await request.json();

  try {
    const customer = await getCustomer(session.customerId);
    const res = await apiRoot
      .customers()
      .withId({ ID: session.customerId })
      .post({
        body: {
          version: customer.version,
          actions: [{ action: 'addAddress', address }],
        },
      })
      .execute();
    return NextResponse.json(res.body);
  } catch (err: any) {
    return NextResponse.json({ error: err?.body?.message ?? 'Failed to add address' }, { status: 400 });
  }
}

export async function PUT(request: NextRequest) {
  const session = await getSession();
  if (!session.customerId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { addressId, address } = await request.json();

  try {
    const customer = await getCustomer(session.customerId);
    const res = await apiRoot
      .customers()
      .withId({ ID: session.customerId })
      .post({
        body: {
          version: customer.version,
          actions: [{ action: 'changeAddress', addressId, address }],
        },
      })
      .execute();
    return NextResponse.json(res.body);
  } catch (err: any) {
    return NextResponse.json({ error: err?.body?.message ?? 'Failed to update address' }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  const session = await getSession();
  if (!session.customerId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { addressId } = await request.json();

  try {
    const customer = await getCustomer(session.customerId);
    const res = await apiRoot
      .customers()
      .withId({ ID: session.customerId })
      .post({
        body: {
          version: customer.version,
          actions: [{ action: 'removeAddress', addressId }],
        },
      })
      .execute();
    return NextResponse.json(res.body);
  } catch (err: any) {
    return NextResponse.json({ error: err?.body?.message ?? 'Failed to delete address' }, { status: 400 });
  }
}
