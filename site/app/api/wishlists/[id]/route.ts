import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { getWishlistById, updateWishlist, deleteWishlist } from '@/lib/ct/personal-wishlists';

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session.customerId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  try {
    const wishlist = await getWishlistById(id, session.customerId);
    return NextResponse.json(wishlist);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Not found' }, { status: 404 });
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session.customerId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const { name } = await request.json();

  try {
    const current = await getWishlistById(id, session.customerId);
    const updated = await updateWishlist(current.id, current.version, [
      { action: 'changeName', name: { 'en-US': name } },
    ]);
    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Failed to update wishlist' }, { status: 400 });
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session.customerId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  try {
    const current = await getWishlistById(id, session.customerId);
    await deleteWishlist(current.id, current.version);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Failed to delete wishlist' }, { status: 400 });
  }
}
