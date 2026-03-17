import { NextResponse } from 'next/server'
import { getCategories } from '@/lib/ct/products'

export async function GET() {
  try {
    const categories = await getCategories()

    return NextResponse.json({ categories })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}
