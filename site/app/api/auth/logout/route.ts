import { NextResponse } from 'next/server'
import { clearSession } from '@/lib/session'

export async function POST() {
  try {
    const response = NextResponse.json({ success: true })
    await clearSession(response)
    return response
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Logout failed' },
      { status: 500 }
    )
  }
}
