import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { getWishlists, createWishlist } from '@/lib/ct/personal-wishlists';

export async function GET() {
  const session = await getSession();
  if (!session.customerId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await getWishlists(session.customerId);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Failed to fetch wishlists' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session.customerId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { name } = await request.json();
  if (!name) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  }

  try {
    const wishlist = await createWishlist(session.customerId, name);
    return NextResponse.json(wishlist);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Failed to create wishlist' }, { status: 500 });
  }
}
