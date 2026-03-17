import { NextRequest, NextResponse } from 'next/server'
import { apiRoot } from '@/lib/ct/client'
import { getSession } from '@/lib/session'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sku = searchParams.get('sku')

    if (!sku) {
      return NextResponse.json({ error: 'sku is required' }, { status: 400 })
    }

    const session = await getSession()
    const storeKey = session?.storeKey

    // Look up product by SKU using product projections
    const response = await apiRoot
      .productProjections()
      .search()
      .get({
        queryArgs: {
          'filter.query': `variants.sku:"${sku}"`,
          limit: 1,
          ...(storeKey ? { storeProjection: storeKey } : {}),
        },
      })
      .execute()

    if (response.body.results.length === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    const product = response.body.results[0]
    const variant =
      product.masterVariant?.sku === sku
        ? product.masterVariant
        : product.variants?.find((v: any) => v.sku === sku) ?? product.masterVariant

    // Extract availability from the store's supply channel
    const channels = variant.availability?.channels ?? {}
    const supplyChannelId = session?.supplyChannelId
    const channelData = supplyChannelId && channels[supplyChannelId]
      ? (channels as any)[supplyChannelId]
      : null
    const availableQuantity = channelData?.availableQuantity ?? null
    const isOnStock = channelData?.isOnStock ?? true

    return NextResponse.json({
      product: {
        id: product.id,
        name: product.name,
        variant: {
          id: variant.id,
          sku: variant.sku,
          images: variant.images,
          price: variant.price,
          availableQuantity,
          isOnStock,
        },
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to look up SKU' },
      { status: 500 }
    )
  }
}
