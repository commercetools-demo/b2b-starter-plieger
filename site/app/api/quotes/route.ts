import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { getQuotes } from '@/lib/ct/quotes'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session?.customerId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    if (!session.businessUnitKey) {
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
    const sort = searchParams.get('sort') || undefined

    const quotes = await getQuotes(session.customerId, session.businessUnitKey, {
      limit,
      offset,
      sort,
    })

    return NextResponse.json(quotes)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch quotes' },
      { status: 500 }
    )
  }
}
