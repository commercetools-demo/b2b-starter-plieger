import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import {
  getBusinessUnitsForAssociate,
  createBusinessUnit,
} from '@/lib/ct/business-units'

export async function GET() {
  try {
    const session = await getSession()

    if (!session?.customerId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const businessUnits = await getBusinessUnitsForAssociate(
      session.customerId
    )

    return NextResponse.json({ businessUnits })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch business units' },
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

    const draft = await request.json()
    const businessUnit = await createBusinessUnit(session.customerId, session.businessUnitKey!, draft)

    return NextResponse.json({ businessUnit }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create business unit' },
      { status: 500 }
    )
  }
}
