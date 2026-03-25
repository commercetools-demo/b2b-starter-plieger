import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { apiRoot } from '@/lib/ct/client';

export async function GET() {
  const session = await getSession();
  if (!session.customerId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const res = await apiRoot
      .customers()
      .withId({ ID: session.customerId })
      .get()
      .execute();
    return NextResponse.json(res.body);
  } catch (err: any) {
    return NextResponse.json({ error: err?.body?.message ?? 'Failed to fetch account' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const session = await getSession();
  if (!session.customerId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { firstName, lastName, email } = await request.json();

  try {
    const current = await apiRoot
      .customers()
      .withId({ ID: session.customerId })
      .get()
      .execute();

    const actions: any[] = [];
    if (firstName !== undefined) actions.push({ action: 'setFirstName', firstName });
    if (lastName !== undefined) actions.push({ action: 'setLastName', lastName });
    if (email !== undefined) actions.push({ action: 'changeEmail', email });

    const res = await apiRoot
      .customers()
      .withId({ ID: session.customerId })
      .post({ body: { version: current.body.version, actions } })
      .execute();

    return NextResponse.json(res.body);
  } catch (err: any) {
    return NextResponse.json({ error: err?.body?.message ?? 'Failed to update account' }, { status: 400 });
  }
}
