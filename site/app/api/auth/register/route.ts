import { NextRequest, NextResponse } from 'next/server'
import { createCustomer } from '@/lib/ct/auth'

export async function POST(request: NextRequest) {
  try {
    const { email, password, firstName, lastName, companyName } =
      await request.json()

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'Email, password, firstName, and lastName are required' },
        { status: 400 }
      )
    }

    const customer = await createCustomer(
      email,
      password,
      firstName,
      lastName,
      companyName
    )

    return NextResponse.json({ customer }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Registration failed' },
      { status: error.statusCode || 500 }
    )
  }
}
