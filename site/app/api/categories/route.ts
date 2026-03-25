import { NextResponse } from 'next/server';
import { getCategories } from '@/lib/ct/products';
import { getSession } from '@/lib/session';

export async function GET() {
  try {
    const session = await getSession();
    const categories = await getCategories(session);
    return NextResponse.json({ categories });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch categories' },
      { status: error.statusCode ?? 500 },
    );
  }
}
