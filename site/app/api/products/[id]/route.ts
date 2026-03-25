import { NextRequest, NextResponse } from 'next/server';
import { getProductById } from '@/lib/ct/products';
import { getSession } from '@/lib/session';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const session = await getSession();
    const product = await getProductById(id, session);

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ product, supplyChannelId: session?.supplyChannelId });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch product' },
      { status: error.statusCode ?? 500 },
    );
  }
}
