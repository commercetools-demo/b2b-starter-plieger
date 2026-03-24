import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { getReviewsForProduct, createReview } from '@/lib/ct/ratings';

interface Params { params: Promise<{ productId: string }> }

export async function GET(request: NextRequest, { params }: Params) {
  const { productId } = await params;
  const { searchParams } = request.nextUrl;

  const sort = (searchParams.get('sort') as 'latest' | 'highest' | 'lowest') ?? 'latest';
  const limit = searchParams.get('limit') ? Number(searchParams.get('limit')) : 10;
  const offset = searchParams.get('offset') ? Number(searchParams.get('offset')) : 0;

  try {
    const result = await getReviewsForProduct(productId, { limit, offset, sort });
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Failed to fetch reviews' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session?.customerId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { productId } = await params;
  const { rating, comment, title } = await request.json();

  if (!rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
  }

  try {
    const review = await createReview(productId, session.customerId, rating, comment ?? '', title);
    return NextResponse.json(review, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.body?.message ?? err?.message ?? 'Failed to submit review' }, { status: 500 });
  }
}
