import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import {
  getPurchaseLists,
  createPurchaseList,
} from '@/lib/ct/wishlists'
import { DEFAULT_LOCALE } from '@/i18n/config'

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

    const purchaseLists = await getPurchaseLists(
      session.customerId,
      session.businessUnitKey,
      { limit, offset }
    )

    return NextResponse.json(purchaseLists)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch purchase lists' },
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

    const { name, description, projectInfo } = await request.json()

    if (!name) {
      return NextResponse.json(
        { error: 'name is required' },
        { status: 400 }
      )
    }

    const locale = session.locale ?? DEFAULT_LOCALE.locale
    const purchaseList = await createPurchaseList(
      session.customerId,
      session.businessUnitKey,
      session.storeKey,
      name,
      description,
      projectInfo,
      session.customerId,
      locale
    )

    return NextResponse.json({ purchaseList }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create purchase list' },
      { status: 500 }
    )
  }
}
