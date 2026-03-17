import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import {
  getApprovalRuleById,
  updateApprovalRule,
} from '@/lib/ct/approval-rules'

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

    const approvalRule = await getApprovalRuleById(
      session.businessUnitKey,
      id,
      session.customerId
    )

    return NextResponse.json({ approvalRule })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch approval rule' },
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

    if (!session.businessUnitKey) {
      return NextResponse.json(
        { error: 'Business unit must be selected first' },
        { status: 400 }
      )
    }

    const { id } = await params
    const { version, actions } = await request.json()

    if (version === undefined || !actions) {
      return NextResponse.json(
        { error: 'version and actions are required' },
        { status: 400 }
      )
    }

    const approvalRule = await updateApprovalRule(
      session.businessUnitKey,
      id,
      session.customerId,
      version,
      actions
    )

    return NextResponse.json({ approvalRule })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update approval rule' },
      { status: 500 }
    )
  }
}
