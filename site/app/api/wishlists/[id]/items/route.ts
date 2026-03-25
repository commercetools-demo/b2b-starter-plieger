import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { getWishlistById, addItemToWishlist, removeItemFromWishlist } from '@/lib/ct/personal-wishlists';

interface Params {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session.customerId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const { productId, variantId, quantity } = await request.json();

  try {
    const current = await getWishlistById(id, session.customerId);
    const updated = await addItemToWishlist(current.id, current.version, productId, variantId ?? 1, quantity ?? 1);
    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Failed to add item' }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session.customerId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const { lineItemId } = await request.json();

  try {
    const current = await getWishlistById(id, session.customerId);
    const updated = await removeItemFromWishlist(current.id, current.version, lineItemId);
    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Failed to remove item' }, { status: 400 });
  }
}
