import { NextRequest, NextResponse } from 'next/server'
import { getSession, setSession } from '@/lib/session'
import {
  getCartById,
  setShippingAddress,
  setBillingAddress,
} from '@/lib/ct/cart'
import { createOrderFromCart } from '@/lib/ct/orders'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session?.customerId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    if (!session.cartId || !session.businessUnitKey || !session.storeKey) {
      return NextResponse.json({ error: 'No active cart' }, { status: 400 })
    }

    const { shippingAddress, billingAddress } = await request.json()

    if (!shippingAddress) {
      return NextResponse.json(
        { error: 'shippingAddress is required' },
        { status: 400 }
      )
    }

    let cart = await getCartById(
      session.cartId,
      session.customerId,
      session.businessUnitKey,
      session.storeKey
    )

    // Set shipping address
    cart = await setShippingAddress(
      session.cartId,
      cart.version,
      shippingAddress,
      session.customerId,
      session.businessUnitKey,
      session.storeKey
    )

    // Set billing address (use shipping if not provided)
    cart = await setBillingAddress(
      session.cartId,
      cart.version,
      billingAddress || shippingAddress,
      session.customerId,
      session.businessUnitKey,
      session.storeKey
    )

    // Create order from cart
    const order = await createOrderFromCart(
      session.cartId,
      cart.version,
      session.customerId,
      session.businessUnitKey,
      session.storeKey
    )

    // Clear cartId from session
    const response = NextResponse.json({ order }, { status: 201 })

    await setSession(response, {
      ...session,
      cartId: undefined,
    })

    return response
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Checkout failed' },
      { status: 500 }
    )
  }
}
