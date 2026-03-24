import { NextRequest, NextResponse } from 'next/server';
import { apiRoot } from '@/lib/ct/client';

export async function POST(request: NextRequest) {
  const { tokenValue, newPassword } = await request.json();
  if (!tokenValue || !newPassword) {
    return NextResponse.json({ error: 'Token and new password are required' }, { status: 400 });
  }

  try {
    await apiRoot
      .customers()
      .passwordReset()
      .post({ body: { tokenValue, newPassword } })
      .execute();

    return NextResponse.json({ success: true });
  } catch (err: any) {
    const message = err?.body?.message ?? 'Invalid or expired reset token';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
