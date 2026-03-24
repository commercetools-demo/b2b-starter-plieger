import { NextRequest, NextResponse } from 'next/server'
import { searchProducts } from '@/lib/ct/products'
import { getSession } from '@/lib/session'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const text = searchParams.get('text') || searchParams.get('q') || undefined
    const categoryId = searchParams.get('categoryId') || searchParams.get('category') || undefined
    const limit = searchParams.get('limit')
      ? Number(searchParams.get('limit'))
      : undefined
    const offset = searchParams.get('offset')
      ? Number(searchParams.get('offset'))
      : undefined
    const sort = searchParams.get('sort') || undefined
    const priceCurrency = searchParams.get('priceCurrency') || undefined
    const priceCountry = searchParams.get('priceCountry') || undefined

    // Use store key from query param, or fall back to session's active store
    let storeKey = searchParams.get('storeKey') || undefined
    if (!storeKey) {
      const session = await getSession()
      storeKey = session?.storeKey || undefined
    }

    // Parse filter.{name}=val1,val2 params into filters object
    const filters: Record<string, string[]> = {};
    searchParams.forEach((value, key) => {
      if (key.startsWith('filter.')) {
        filters[key.slice(7)] = value.split(',').filter(Boolean);
      }
    });

    const results = await searchProducts({
      text,
      categoryId,
      limit,
      offset,
      sort,
      priceCurrency,
      priceCountry,
      storeKey,
      filters: Object.keys(filters).length > 0 ? filters : undefined,
    })

    return NextResponse.json(results)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to search products' },
      { status: 500 }
    )
  }
}
