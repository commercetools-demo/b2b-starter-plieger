import { NextRequest, NextResponse } from 'next/server';
import { searchProducts } from '@/lib/ct/products';
import { getSession } from '@/lib/session';
import type { ProductQuery } from '@/lib/ct/product-types';
import { FilterTypes } from '@/lib/ct/product-types';
import type { TermFilter } from '@/lib/ct/product-types';

/**
 * POST /api/products
 *
 * Accepts a ProductQuery JSON body. Session B2B fields (store, channels,
 * productSelectionId, accountGroupIds) are injected from the session if not
 * already provided by the caller.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    const body = (await request.json()) as ProductQuery;

    const productQuery: ProductQuery = {
      limit: 24,
      ...body,
      storeKey: body.storeKey ?? session.storeKey,
      distributionChannelId: body.distributionChannelId ?? session.distributionChannelId,
      supplyChannelId: body.supplyChannelId ?? session.supplyChannelId,
      productSelectionId: body.productSelectionId ?? session.productSelectionId,
      accountGroupIds: body.accountGroupIds ?? session.accountGroupIds,
    };

    const result = await searchProducts(productQuery, session);

    return NextResponse.json({
      results: result.items,
      total: result.total,
      count: result.count,
      facets: result.facets,
      nextCursor: result.nextCursor,
      previousCursor: result.previousCursor,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to search products' },
      { status: error.statusCode ?? 500 },
    );
  }
}

/**
 * GET /api/products — translates query-param filters into a ProductQuery.
 * Kept for pages that haven't yet migrated to POST.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const session = await getSession();

    const text = searchParams.get('text') || searchParams.get('q') || undefined;
    const categoryId = searchParams.get('categoryId') || searchParams.get('category') || undefined;
    const limit = searchParams.get('limit') ? Number(searchParams.get('limit')) : 24;
    const cursor = searchParams.get('cursor') || undefined;
    const sortParam = searchParams.get('sort') || undefined;

    let sortAttributes: Record<string, 'asc' | 'desc'> | undefined;
    if (sortParam && sortParam !== 'score') {
      const [field, order] = sortParam.split('-');
      if (field) sortAttributes = { [field]: order === 'desc' ? 'desc' : 'asc' };
    }

    const filters: TermFilter[] = [];
    searchParams.forEach((value, key) => {
      if (key.startsWith('filter.')) {
        const terms = value.split(',').filter(Boolean);
        if (terms.length) {
          filters.push({ identifier: key.slice(7), type: FilterTypes.TERM, terms });
        }
      }
    });

    const productQuery: ProductQuery = {
      limit,
      cursor,
      query: text,
      categories: categoryId ? [categoryId] : undefined,
      filters: filters.length ? filters : undefined,
      sortAttributes,
      storeKey: session.storeKey,
      distributionChannelId: session.distributionChannelId,
      supplyChannelId: session.supplyChannelId,
      productSelectionId: session.productSelectionId,
      accountGroupIds: session.accountGroupIds,
    };

    const result = await searchProducts(productQuery, session);

    return NextResponse.json({
      results: result.items,
      total: result.total,
      count: result.count,
      facets: result.facets,
      nextCursor: result.nextCursor,
      previousCursor: result.previousCursor,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to search products' },
      { status: error.statusCode ?? 500 },
    );
  }
}
