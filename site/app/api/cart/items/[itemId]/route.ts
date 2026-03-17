import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import {
  getCartById,
  changeLineItemQuantity,
  removeLineItem,
} from '@/lib/ct/cart'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    const session = await getSession()

    if (!session?.customerId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    if (!session.cartId || !session.businessUnitKey || !session.storeKey) {
      return NextResponse.json({ error: 'No active cart' }, { status: 400 })
    }

    const { itemId } = await params
    const { quantity } = await request.json()

    if (quantity === undefined) {
      return NextResponse.json(
        { error: 'quantity is required' },
        { status: 400 }
      )
    }

    const existingCart = await getCartById(
      session.cartId,
      session.customerId,
      session.businessUnitKey,
      session.storeKey
    )

    const cart = await changeLineItemQuantity(
      session.cartId,
      existingCart.version,
      itemId,
      quantity,
      session.customerId,
      session.businessUnitKey,
      session.storeKey
    )

    return NextResponse.json({ cart })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update item quantity' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    const session = await getSession()

    if (!session?.customerId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    if (!session.cartId || !session.businessUnitKey || !session.storeKey) {
      return NextResponse.json({ error: 'No active cart' }, { status: 400 })
    }

    const { itemId } = await params
    const existingCart = await getCartById(
      session.cartId,
      session.customerId,
      session.businessUnitKey,
      session.storeKey
    )

    const cart = await removeLineItem(
      session.cartId,
      existingCart.version,
      itemId,
      session.customerId,
      session.businessUnitKey,
      session.storeKey
    )

    return NextResponse.json({ cart })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to remove item' },
      { status: 500 }
    )
  }
}
