import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { getCustomerById } from '@/lib/ct/auth'

export async function GET() {
  try {
    const session = await getSession()

    if (!session?.customerId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const customer = await getCustomerById(session.customerId)

    return NextResponse.json({
      customer,
      businessUnitKey: session.businessUnitKey,
      storeKey: session.storeKey,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to get current user' },
      { status: 500 }
    )
  }
}
