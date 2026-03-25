import { NextRequest, NextResponse } from 'next/server'
import { loginCustomer } from '@/lib/ct/auth'
import { getBusinessUnitsForAssociate } from '@/lib/ct/business-units'
import { getStoreChannelData } from '@/lib/ct/stores'
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

    const firstBU = businessUnits[0]
    const firstStore = firstBU?.stores?.[0]
    let storeSession = {}
    if (firstBU && firstStore) {
      const channelData = await getStoreChannelData(firstStore.key)
      storeSession = {
        businessUnitKey: firstBU.key,
        storeKey: firstStore.key,
        ...channelData,
      }
    }

    const response = NextResponse.json({ customer, businessUnits })

    await setSession(response, {
      customerId: customer.id,
      customerEmail: customer.email,
      customerFirstName: customer.firstName,
      customerLastName: customer.lastName,
      ...storeSession,
    })

    return response
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Login failed' },
      { status: error.statusCode || 500 }
    )
  }
}
