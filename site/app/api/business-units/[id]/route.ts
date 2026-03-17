import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import {
  getBusinessUnitById,
  getBusinessUnitByKey,
  updateBusinessUnit,
} from '@/lib/ct/business-units'

// Determine if the param looks like a UUID (id) or a key
function isUUID(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)
}

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
    const businessUnit = isUUID(id)
      ? await getBusinessUnitById(id)
      : await getBusinessUnitByKey(id)

    return NextResponse.json({ businessUnit })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch business unit' },
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
    const { version, actions } = await request.json()

    if (version === undefined || !actions) {
      return NextResponse.json(
        { error: 'version and actions are required' },
        { status: 400 }
      )
    }

    const businessUnit = await updateBusinessUnit(session.customerId, session.businessUnitKey!, id, version, actions)

    return NextResponse.json({ businessUnit })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update business unit' },
      { status: 500 }
    )
  }
}
