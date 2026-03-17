import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import {
  getApprovalRulesAdmin,
  createApprovalRule,
} from '@/lib/ct/approval-rules'

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

    const approvalRules = await getApprovalRulesAdmin(
      session.businessUnitKey,
      session.customerId,
      { limit, offset }
    )

    return NextResponse.json(approvalRules)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch approval rules' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
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

    const draft = await request.json()

    const approvalRule = await createApprovalRule(
      session.businessUnitKey,
      session.customerId,
      draft
    )

    return NextResponse.json({ approvalRule }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create approval rule' },
      { status: 500 }
    )
  }
}
