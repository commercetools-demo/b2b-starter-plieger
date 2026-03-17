import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import {
  getQuoteById,
  acceptQuote,
  declineQuote,
  renegotiateQuote,
} from '@/lib/ct/quotes'

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
    const quote = await getQuoteById(
      session.customerId,
      session.businessUnitKey!,
      id
    )

    return NextResponse.json({ quote })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch quote' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()

    if (!session?.customerId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { id } = await params
    const { action, version, buyerComment } = await request.json()

    if (!action || version === undefined) {
      return NextResponse.json(
        { error: 'action and version are required' },
        { status: 400 }
      )
    }

    let quote
    switch (action) {
      case 'accept':
        quote = await acceptQuote(session.customerId, session.businessUnitKey!, id, version)
        break
      case 'decline':
        quote = await declineQuote(session.customerId, session.businessUnitKey!, id, version)
        break
      case 'renegotiate':
        quote = await renegotiateQuote(session.customerId, session.businessUnitKey!, id, version, buyerComment)
        break
      default:
        return NextResponse.json(
          { error: 'Invalid action. Must be accept, decline, or renegotiate' },
          { status: 400 }
        )
    }

    return NextResponse.json({ quote })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update quote' },
      { status: 500 }
    )
  }
}
