import { NextRequest, NextResponse } from 'next/server'
import { getProductBySlug } from '@/lib/ct/products'
import { getSession } from '@/lib/session'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const { searchParams } = new URL(request.url)
    const locale = searchParams.get('locale') || undefined

    // Get store key from session for store-scoped pricing
    const session = await getSession()
    const storeKey = session?.storeKey || undefined

    const product = await getProductBySlug(slug, locale, storeKey)

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ product, supplyChannelId: session?.supplyChannelId })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch product' },
      { status: 500 }
    )
  }
}
