import { NextRequest, NextResponse } from 'next/server';
import { apiRoot } from '@/lib/ct/client';

export async function POST(request: NextRequest) {
  const { token } = await request.json();
  if (!token) {
    return NextResponse.json({ error: 'Token is required' }, { status: 400 });
  }

  try {
    await apiRoot
      .customers()
      .emailConfirm()
      .post({ body: { tokenValue: token } })
      .execute();

    return NextResponse.json({ success: true });
  } catch (err: any) {
    const message = err?.body?.message ?? 'Invalid or expired confirmation token';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
