import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { getQuoteRequestById, cancelQuoteRequest } from '@/lib/ct/quotes'

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
    const quoteRequest = await getQuoteRequestById(
      session.customerId,
      session.businessUnitKey!,
      id
    )

    return NextResponse.json({ quoteRequest })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch quote request' },
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

    const quoteRequest = await cancelQuoteRequest(
      session.customerId,
      session.businessUnitKey!,
      id,
      version
    )

    return NextResponse.json({ quoteRequest })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to cancel quote request' },
      { status: 500 }
    )
  }
}
