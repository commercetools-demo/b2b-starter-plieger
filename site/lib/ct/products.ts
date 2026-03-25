/**
 * Public product/category utility functions for b2b-starter.
 *
 * Thin wrappers over ProductApi. Session is accepted as an optional parameter:
 * - API routes pass the session they already fetched.
 * - Server Components (app/c/page.tsx, app/c/[slug]/page.tsx) that cannot
 *   easily obtain the session call getSession() internally via the helpers below.
 */
import { getSession } from '../session';
import { ProductApi } from './product-api';
import type { ProductQuery, CategoryQuery, ProductPaginatedResult } from './product-types';
import type { SessionData } from '../types';

// ---------------------------------------------------------------------------
// Product search
// ---------------------------------------------------------------------------

export async function searchProducts(
  query: ProductQuery,
  session?: Partial<SessionData>,
): Promise<ProductPaginatedResult> {
  const s = session ?? await getSession();
  return new ProductApi(s).query(query);
}

// ---------------------------------------------------------------------------
// Single product lookup
// ---------------------------------------------------------------------------

export async function getProductBySlug(
  slug: string,
  locale = 'en-US',
  session?: Partial<SessionData>,
) {
  const s = session ?? await getSession();
  return new ProductApi(s).getProductBySlug(slug, locale);
}

export async function getProductById(
  id: string,
  session?: Partial<SessionData>,
) {
  const s = session ?? await getSession();
  return new ProductApi(s).getProduct({ productIds: [id] });
}

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

export async function getCategories(session?: Partial<SessionData>) {
  const s = session ?? await getSession();
  const result = await new ProductApi(s).queryCategories({ limit: 500 });
  return result.items;
}

export async function getCategoryBySlug(slug: string, locale = 'en-US', session?: Partial<SessionData>) {
  const s = session ?? await getSession();
  // locale is used to derive the language for the slug query inside ProductApi
  const api = new ProductApi({ ...s, locale: s.locale ?? locale });
  const result = await api.queryCategories({ slug, limit: 1 });
  return result.items[0] ?? null;
}

export async function queryCategories(
  categoryQuery: CategoryQuery,
  session?: Partial<SessionData>,
) {
  const s = session ?? await getSession();
  return new ProductApi(s).queryCategories(categoryQuery);
}
