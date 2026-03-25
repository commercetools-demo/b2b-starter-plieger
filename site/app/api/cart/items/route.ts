import { NextRequest, NextResponse } from 'next/server'
import { getSession, setSession } from '@/lib/session'
import { addLineItem, addLineItemWithRecurrence, createCart, getCartById, updateCart } from '@/lib/ct/cart'
import { apiRoot } from '@/lib/ct/client'

// Cache store distribution channels
const storeChannelCache = new Map<string, string>()

async function getDistributionChannelForStore(storeKey: string): Promise<string | undefined> {
  if (storeChannelCache.has(storeKey)) {
    return storeChannelCache.get(storeKey)
  }
  try {
    const store = await apiRoot
      .stores()
      .withKey({ key: storeKey })
      .get()
      .execute()
    const channelId = store.body.distributionChannels?.[0]?.id
    if (channelId) {
      storeChannelCache.set(storeKey, channelId)
    }
    return channelId
  } catch {
    return undefined
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

    const { productId, variantId, quantity, recurrencePolicyId } = await request.json()

    if (!productId || !variantId) {
      return NextResponse.json(
        { error: 'productId and variantId are required' },
        { status: 400 }
      )
    }

    let cartId = session.cartId
    let cartVersion: number
    let needsSessionUpdate = false

    if (!cartId) {
      const newCart = await createCart(
        session.customerId,
        session.customerId,
        session.businessUnitKey,
        session.storeKey
      )
      cartId = newCart.id
      cartVersion = newCart.version
      needsSessionUpdate = true
    } else {
      const existingCart = await getCartById(
        cartId,
        session.customerId,
        session.businessUnitKey,
        session.storeKey
      )
      cartVersion = existingCart.version
      // Ensure cart has country set for price selection
      if (!existingCart.country) {
        const updated = await updateCart(
          cartId,
          cartVersion,
          [{ action: 'setCountry', country: 'US' }],
          session.customerId,
          session.businessUnitKey,
          session.storeKey
        )
        cartVersion = updated.version
      }
    }

    // Look up the store's distribution channel for price selection
    const distributionChannelId = await getDistributionChannelForStore(session.storeKey)

    const cart = recurrencePolicyId
      ? await addLineItemWithRecurrence(
          cartId!,
          cartVersion,
          productId,
          variantId,
          quantity || 1,
          recurrencePolicyId,
          session.customerId,
          session.businessUnitKey!,
          session.storeKey!,
          distributionChannelId
        )
      : await addLineItem(
          cartId!,
          cartVersion,
          productId,
          variantId,
          quantity || 1,
          session.customerId,
          session.businessUnitKey!,
          session.storeKey!,
          distributionChannelId
        )

    const response = NextResponse.json({ cart }, { status: 201 })

    if (needsSessionUpdate) {
      await setSession(response, {
        ...session,
        cartId,
      })
    }

    return response
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to add item to cart' },
      { status: 500 }
    )
  }
}
