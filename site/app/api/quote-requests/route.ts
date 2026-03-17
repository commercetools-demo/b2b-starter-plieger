import { NextRequest, NextResponse } from 'next/server'
import { getSession, setSession } from '@/lib/session'
import { getQuoteRequests, createQuoteRequest } from '@/lib/ct/quotes'
import { getCartById, setShippingAddress } from '@/lib/ct/cart'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session?.customerId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    if (!session.businessUnitKey) {
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

    const quoteRequests = await getQuoteRequests(session.customerId, session.businessUnitKey, {
      limit,
      offset,
      sort,
    })

    return NextResponse.json(quoteRequests)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch quote requests' },
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

    if (!session.cartId || !session.businessUnitKey || !session.storeKey) {
      return NextResponse.json({ error: 'No active cart' }, { status: 400 })
    }

    const { comment, poNumber } = await request.json().catch(() => ({}))

    let cart = await getCartById(
      session.cartId,
      session.customerId,
      session.businessUnitKey,
      session.storeKey
    )

    // Ensure cart has a shipping address (required for quote requests)
    if (!cart.shippingAddress) {
      cart = await setShippingAddress(
        session.cartId,
        cart.version,
        { country: cart.country || 'US' },
        session.customerId,
        session.businessUnitKey,
        session.storeKey
      )
    }

    const quoteRequest = await createQuoteRequest(
      session.customerId,
      session.businessUnitKey!,
      session.cartId,
      cart.version,
      comment,
      poNumber
    )

    // Clear cartId from session since cart is now tied to quote request
    const response = NextResponse.json({ quoteRequest }, { status: 201 })

    await setSession(response, {
      ...session,
      cartId: undefined,
    })

    return response
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create quote request' },
      { status: 500 }
    )
  }
}
