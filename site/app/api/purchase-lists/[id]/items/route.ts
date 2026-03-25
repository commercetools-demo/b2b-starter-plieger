import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import {
  addItemToPurchaseList,
  removeItemFromPurchaseList,
} from '@/lib/ct/wishlists'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()

    if (!session?.customerId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { id } = await params
    const { version, productId, variantId, quantity } = await request.json()

    if (version === undefined || !productId) {
      return NextResponse.json(
        { error: 'version and productId are required' },
        { status: 400 }
      )
    }

    const purchaseList = await addItemToPurchaseList(
      session.customerId,
      session.businessUnitKey!,
      session.storeKey!,
      id,
      version,
      productId,
      variantId,
      quantity
    )

    return NextResponse.json({ purchaseList }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to add item to purchase list' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()

    if (!session?.customerId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { id } = await params
    const { version, lineItemId } = await request.json()

    if (version === undefined || !lineItemId) {
      return NextResponse.json(
        { error: 'version and lineItemId are required' },
        { status: 400 }
      )
    }

    const purchaseList = await removeItemFromPurchaseList(
      session.customerId,
      session.businessUnitKey!,
      id,
      version,
      lineItemId
    )

    return NextResponse.json({ purchaseList })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to remove item from purchase list' },
      { status: 500 }
    )
  }
}
