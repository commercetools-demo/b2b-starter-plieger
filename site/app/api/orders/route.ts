import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { getOrdersForBusinessUnit } from '@/lib/ct/orders'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session?.customerId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    if (!session.businessUnitKey || !session.storeKey) {
      return NextResponse.json(
        { error: 'Business unit must be selected first' },
        { status: 400 }
      )
    }

    const { searchParams } = new URL(request.url)
    const limit = searchParams.get('limit')
      ? Number(searchParams.get('limit'))
      : undefined
    const offset = searchParams.get('offset')
      ? Number(searchParams.get('offset'))
      : undefined
    const sort = searchParams.get('sort') || undefined
    const status = searchParams.get('status') || undefined

    const orders = await getOrdersForBusinessUnit(
      session.businessUnitKey,
      session.customerId,
      { limit, offset, sort, status }
    )

    return NextResponse.json(orders)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}
