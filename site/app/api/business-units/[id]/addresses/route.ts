import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import {
  addBusinessUnitAddress,
  removeBusinessUnitAddress,
} from '@/lib/ct/business-units'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()

    if (!session?.customerId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { id } = await params
    const { version, address } = await request.json()

    if (version === undefined || !address) {
      return NextResponse.json(
        { error: 'version and address are required' },
        { status: 400 }
      )
    }

    const businessUnit = await addBusinessUnitAddress(session.customerId, session.businessUnitKey!, id, version, address)

    return NextResponse.json({ businessUnit }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to add address' },
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
    const { version, addressId } = await request.json()

    if (version === undefined || !addressId) {
      return NextResponse.json(
        { error: 'version and addressId are required' },
        { status: 400 }
      )
    }

    const businessUnit = await removeBusinessUnitAddress(
      session.customerId,
      session.businessUnitKey!,
      id,
      version,
      addressId
    )

    return NextResponse.json({ businessUnit })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to remove address' },
      { status: 500 }
    )
  }
}
