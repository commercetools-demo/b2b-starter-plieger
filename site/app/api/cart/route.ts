import { NextRequest, NextResponse } from 'next/server'
import { getSession, setSession } from '@/lib/session'
import { createCart, getCartById } from '@/lib/ct/cart'

export async function GET() {
  try {
    const session = await getSession()

    if (!session?.customerId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    if (!session.cartId || !session.businessUnitKey || !session.storeKey) {
      return NextResponse.json({ cart: null })
    }

    const cart = await getCartById(
      session.cartId,
      session.customerId,
      session.businessUnitKey,
      session.storeKey
    )

    return NextResponse.json({ cart })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch cart' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
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

    const { currency } = await request.json().catch(() => ({}))

    const cart = await createCart(
      session.customerId,
      session.customerId,
      session.businessUnitKey,
      session.storeKey,
      currency
    )

    const response = NextResponse.json({ cart }, { status: 201 })

    await setSession(response, {
      ...session,
      cartId: cart.id,
    })

    return response
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create cart' },
      { status: 500 }
    )
  }
}
