import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { getAssociateRoles } from '@/lib/ct/associate-roles'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session?.customerId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const buyerAssignable = searchParams.get('buyerAssignable')
    const options = buyerAssignable !== null
      ? { buyerAssignable: buyerAssignable === 'true' }
      : undefined

    const roles = await getAssociateRoles(options)

    return NextResponse.json({ roles })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch associate roles' },
      { status: 500 }
    )
  }
}
