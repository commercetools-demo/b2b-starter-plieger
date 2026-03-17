import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { getApprovalFlows } from '@/lib/ct/approval-flows'

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
    const status = searchParams.get('status') || undefined

    const approvalFlows = await getApprovalFlows(
      session.businessUnitKey,
      session.customerId,
      { limit, offset, status }
    )

    return NextResponse.json(approvalFlows)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch approval flows' },
      { status: 500 }
    )
  }
}
