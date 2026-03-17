import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import {
  addAssociate,
  removeAssociate,
  changeAssociateRoles,
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
    const { version, associate } = await request.json()

    if (version === undefined || !associate) {
      return NextResponse.json(
        { error: 'version and associate are required' },
        { status: 400 }
      )
    }

    const businessUnit = await addAssociate(session.customerId, session.businessUnitKey!, id, version, associate)

    return NextResponse.json({ businessUnit }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to add associate' },
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
    const { version, customerId, roleAssignments } = await request.json()

    if (version === undefined || !customerId || !roleAssignments) {
      return NextResponse.json(
        { error: 'version, customerId, and roleAssignments are required' },
        { status: 400 }
      )
    }

    const businessUnit = await changeAssociateRoles(
      session.customerId,
      session.businessUnitKey!,
      id,
      version,
      customerId,
      roleAssignments
    )

    return NextResponse.json({ businessUnit })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to change associate roles' },
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
    const { version, customerId } = await request.json()

    if (version === undefined || !customerId) {
      return NextResponse.json(
        { error: 'version and customerId are required' },
        { status: 400 }
      )
    }

    const businessUnit = await removeAssociate(session.customerId, session.businessUnitKey!, id, version, customerId)

    return NextResponse.json({ businessUnit })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to remove associate' },
      { status: 500 }
    )
  }
}
