import { NextRequest, NextResponse } from 'next/server'
import { getSession, setSession } from '@/lib/session'
import { getStoreChannelData } from '@/lib/ct/stores'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()

    if (!session?.customerId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { businessUnitKey, storeKey } = await request.json()

    if (!businessUnitKey || !storeKey) {
      return NextResponse.json(
        { error: 'businessUnitKey and storeKey are required' },
        { status: 400 }
      )
    }

    const { supplyChannelId, distributionChannelId, productSelectionId } =
      await getStoreChannelData(storeKey)

    const response = NextResponse.json({ success: true })

    await setSession(response, {
      ...session,
      businessUnitKey,
      storeKey,
      supplyChannelId,
      distributionChannelId,
      productSelectionId,
    })

    return response
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to select business unit' },
      { status: 500 }
    )
  }
}
