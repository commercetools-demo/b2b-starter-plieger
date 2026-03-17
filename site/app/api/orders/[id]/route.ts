import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { getOrderById, updateOrderState } from '@/lib/ct/orders'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()

    if (!session?.customerId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { id } = await params
    const order = await getOrderById(
      id,
      session.customerId,
      session.businessUnitKey!,
      session.storeKey
    )

    return NextResponse.json({ order })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch order' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()

    if (!session?.customerId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { id } = await params
    const { version, orderState } = await request.json()

    if (version === undefined || !orderState) {
      return NextResponse.json(
        { error: 'version and orderState are required' },
        { status: 400 }
      )
    }

    const order = await updateOrderState(
      id,
      version,
      orderState,
      session.customerId,
      session.businessUnitKey!,
      session.storeKey
    )

    return NextResponse.json({ order })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update order state' },
      { status: 500 }
    )
  }
}
