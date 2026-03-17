import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import {
  getApprovalFlowById,
  approveApprovalFlow,
  rejectApprovalFlow,
} from '@/lib/ct/approval-flows'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params

    const approvalFlow = await getApprovalFlowById(
      session.businessUnitKey,
      id,
      session.customerId
    )

    return NextResponse.json({ approvalFlow })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch approval flow' },
      { status: 500 }
    )
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

    if (!session.businessUnitKey) {
      return NextResponse.json(
        { error: 'Business unit must be selected first' },
        { status: 400 }
      )
    }

    const { id } = await params
    const { action, reason } = await request.json()

    if (!action) {
      return NextResponse.json(
        { error: 'action is required (approve or reject)' },
        { status: 400 }
      )
    }

    let approvalFlow
    switch (action) {
      case 'approve':
        approvalFlow = await approveApprovalFlow(
          session.businessUnitKey,
          id,
          session.customerId
        )
        break
      case 'reject':
        approvalFlow = await rejectApprovalFlow(
          session.businessUnitKey,
          id,
          session.customerId,
          reason
        )
        break
      default:
        return NextResponse.json(
          { error: 'Invalid action. Must be approve or reject' },
          { status: 400 }
        )
    }

    return NextResponse.json({ approvalFlow })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to process approval flow' },
      { status: 500 }
    )
  }
}
