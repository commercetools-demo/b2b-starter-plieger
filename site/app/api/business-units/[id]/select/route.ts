import { NextRequest, NextResponse } from 'next/server'
import { getSession, setSession } from '@/lib/session'
import { apiRoot } from '@/lib/ct/client'

// Cache store supply channels
const storeSupplyChannelCache = new Map<string, string | undefined>()

async function getSupplyChannelForStore(storeKey: string): Promise<string | undefined> {
  if (storeSupplyChannelCache.has(storeKey)) {
    return storeSupplyChannelCache.get(storeKey)
  }
  try {
    const store = await apiRoot
      .stores()
      .withKey({ key: storeKey })
      .get()
      .execute()
    const channelId = store.body.supplyChannels?.[0]?.id
    storeSupplyChannelCache.set(storeKey, channelId)
    return channelId
  } catch {
    return undefined
  }
}

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

    // Look up the store's supply channel for inventory
    const supplyChannelId = await getSupplyChannelForStore(storeKey)

    const response = NextResponse.json({ success: true })

    await setSession(response, {
      ...session,
      businessUnitKey,
      storeKey,
      supplyChannelId,
    })

    return response
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to select business unit' },
      { status: 500 }
    )
  }
}
