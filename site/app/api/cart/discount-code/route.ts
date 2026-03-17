import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { getCartById, addDiscountCode } from '@/lib/ct/cart'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session?.customerId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    if (!session.cartId || !session.businessUnitKey || !session.storeKey) {
      return NextResponse.json({ error: 'No active cart' }, { status: 400 })
    }

    const { code } = await request.json()

    if (!code) {
      return NextResponse.json(
        { error: 'Discount code is required' },
        { status: 400 }
      )
    }

    const existingCart = await getCartById(
      session.cartId,
      session.customerId,
      session.businessUnitKey,
      session.storeKey
    )

    const cart = await addDiscountCode(
      session.cartId,
      existingCart.version,
      code,
      session.customerId,
      session.businessUnitKey,
      session.storeKey
    )

    return NextResponse.json({ cart })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to apply discount code' },
      { status: 500 }
    )
  }
}
