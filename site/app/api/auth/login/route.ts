import { NextRequest, NextResponse } from 'next/server'
import { loginCustomer } from '@/lib/ct/auth'
import { getBusinessUnitsForAssociate } from '@/lib/ct/business-units'
import { setSession } from '@/lib/session'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    const customer = await loginCustomer(email, password)
    const businessUnits = await getBusinessUnitsForAssociate(customer.id)

    const response = NextResponse.json({ customer, businessUnits })

    await setSession(response, {
      customerId: customer.id,
      customerEmail: customer.email,
      customerFirstName: customer.firstName,
      customerLastName: customer.lastName,
    })

    return response
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Login failed' },
      { status: error.statusCode || 500 }
    )
  }
}
