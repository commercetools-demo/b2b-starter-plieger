import { NextRequest, NextResponse } from 'next/server';
import { searchProducts } from '@/lib/ct/products';
import { localizedString } from '@/lib/utils';

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q') ?? '';

  if (q.length < 2) {
    return NextResponse.json([]);
  }

  try {
    const result = await searchProducts({ text: q, limit: 8 });
    const suggestions = result.results.map((p: any) => ({
      id: p.id,
      name: localizedString(p.name),
      sku: p.masterVariant?.sku,
      image: p.masterVariant?.images?.[0]?.url,
      url: `/products/${localizedString(p.slug)}`,
    }));
    return NextResponse.json(suggestions);
  } catch {
    return NextResponse.json([]);
  }
}
