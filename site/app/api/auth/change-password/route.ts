import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { apiRoot } from '@/lib/ct/client';

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session.customerId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { currentPassword, newPassword } = await request.json();
  if (!currentPassword || !newPassword) {
    return NextResponse.json({ error: 'Both passwords are required' }, { status: 400 });
  }

  try {
    const customer = await apiRoot
      .customers()
      .withId({ ID: session.customerId })
      .get()
      .execute();

    await apiRoot
      .customers()
      .password()
      .post({
        body: {
          version: customer.body.version,
          currentPassword,
          newPassword,
          id: session.customerId,
        },
      })
      .execute();

    return NextResponse.json({ success: true });
  } catch (err: any) {
    const message = err?.body?.message ?? 'Failed to change password';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
