import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import {
  getPurchaseListById,
  deletePurchaseList,
} from '@/lib/ct/wishlists'

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
    const purchaseList = await getPurchaseListById(session.customerId, session.businessUnitKey!, id)

    return NextResponse.json({ purchaseList })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch purchase list' },
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
    const { version } = await request.json()

    if (version === undefined) {
      return NextResponse.json(
        { error: 'version is required' },
        { status: 400 }
      )
    }

    await deletePurchaseList(session.customerId, session.businessUnitKey!, id, version)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to delete purchase list' },
      { status: 500 }
    )
  }
}
