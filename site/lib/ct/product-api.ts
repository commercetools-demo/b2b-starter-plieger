/**
 * ProductApi — session-aware CT product/category query class.
 *
 * Ported from multitenant-frontend B2BProductApi, adapted to use the existing
 * apiRoot from client.ts instead of the heavy BaseApi abstraction.
 *
 * All session fields are optional so non-logged-in requests work correctly
 * (no store/channel context → prices won't be scoped, "Price on request" shows).
 */
import type { ProductProjection, Category as CTCategory } from '@commercetools/platform-sdk';
import { apiRoot } from './client';
import { ProductSearchFactory } from './product-search-factory';
import { DEFAULT_LOCALE, LANGUAGE_LOCALE_MAP } from '@/i18n/config';
import type {
  ProductQuery,
  ProductPaginatedResult,
  CategoryQuery,
  Locale,
  FacetConfiguration,
} from './product-types';
import type { SessionData } from '../types';

// ---------------------------------------------------------------------------
// Module-level caches (in-memory, reset on server restart)
// ---------------------------------------------------------------------------

const storeIdCache = new Map<string, string>();

// ---------------------------------------------------------------------------
// Expands for product projections (pricing, discounts, product type)
// ---------------------------------------------------------------------------

const PRODUCT_PROJECTION_EXPANDS = [
  'categories[*].ancestors[*]',
  'categories[*].parent',
  'masterVariant.price.discounted.discount',
  'masterVariant.prices[*].discounted.discount',
  'variants[*].price.discounted.discount',
  'variants[*].prices[*].discounted.discount',
  'productType',
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getLocale(session: Partial<SessionData>): Locale {
  const rawLocale = session.locale ?? DEFAULT_LOCALE.locale;
  const resolvedLocale = LANGUAGE_LOCALE_MAP[rawLocale] ? rawLocale : DEFAULT_LOCALE.locale;
  const config = LANGUAGE_LOCALE_MAP[resolvedLocale];
  return {
    language: resolvedLocale,
    country: config.country,
    currency: session.currency ?? DEFAULT_LOCALE.currency,
  };
}

// ---------------------------------------------------------------------------
// ProductApi
// ---------------------------------------------------------------------------

export class ProductApi {
  private session: Partial<SessionData>;

  constructor(session: Partial<SessionData> = {}) {
    this.session = session;
  }

  // --------------------------------------------------------------------------
  // query — two-step: Product Search → Product Projections enrichment
  // --------------------------------------------------------------------------

  async query(
    productQuery: ProductQuery,
    facetConfigurations: FacetConfiguration[] = [],
  ): Promise<ProductPaginatedResult> {
    const locale = getLocale(this.session);

    // Resolve storeKey → storeId for store-scoped product filtering
    if (this.session.storeKey) {
      const storeId = await this.getStoreId(this.session.storeKey);
      if (storeId) {
        productQuery = {
          ...productQuery,
          store: { storeId, key: this.session.storeKey },
        };
      }
    }

    // Inject all session B2B fields if not already set by caller
    productQuery = {
      distributionChannelId: this.session.distributionChannelId,
      supplyChannelId: this.session.supplyChannelId,
      productSelectionId: this.session.productSelectionId,
      accountGroupIds: this.session.accountGroupIds,
      ...productQuery,
    };

    // Merge query-level facet configs with any passed in separately
    const allFacetConfigs: FacetConfiguration[] = [
      ...(productQuery.facetConfigurations ?? []),
      ...facetConfigurations,
    ];

    const searchRequest = ProductSearchFactory.createCommercetoolsProductSearchRequestFromProductQuery(
      productQuery,
      allFacetConfigs,
      locale,
      'key',
    );


    const response = await apiRoot
      .products()
      .search()
      .post({ body: searchRequest as any })
      .execute();

      console.log('Product search response', response)

    let searchResults = response.body.results as any[];
    const productIds: string[] = searchResults.map((r: any) => r.id).filter(Boolean);

    // Step 2: Enrich with full projections for channel-scoped pricing
    if (productIds.length > 0) {
      const projections = await this.fetchProductProjectionsByIds(
        productIds,
        locale,
        productQuery.distributionChannelId,
        this.session.storeKey,
        productQuery.accountGroupIds,
      );
      const projectionsMap = new Map(projections.map((p) => [p.id, p]));
      searchResults = searchResults.map((r: any) => {
        const projection = projectionsMap.get(r.id);
        return projection ? { ...r, productProjection: projection } : r;
      });
    }

    const items: ProductProjection[] = searchResults.map((r: any) => r.productProjection ?? r);
    const count = searchResults.length;
    const offset = response.body.offset ?? 0;
    const total = response.body.total ?? 0;

    return {
      total,
      count,
      items,
      facets: (response.body as any).facets ?? [],
      previousCursor: offset > 0 ? `offset:${Math.max(0, offset - count)}` : undefined,
      nextCursor: offset + count < total ? `offset:${offset + count}` : undefined,
      query: productQuery,
    };
  }

  // --------------------------------------------------------------------------
  // getProduct — by ID, key, or SKU (all store + channel scoped)
  // --------------------------------------------------------------------------

  async getProduct(productQuery: ProductQuery): Promise<ProductProjection> {
    const locale = getLocale(this.session);
    const { distributionChannelId, storeKey, accountGroupIds } = this.session;

    if (productQuery.productIds?.length) {
      return this.fetchProductProjectionById(
        productQuery.productIds[0],
        locale,
        distributionChannelId,
        storeKey,
        accountGroupIds,
      );
    }

    if (productQuery.productKeys?.length) {
      return this.fetchProductProjectionByKey(
        productQuery.productKeys[0],
        locale,
        distributionChannelId,
        storeKey,
        accountGroupIds,
      );
    }

    if (productQuery.skus?.length) {
      return this.fetchProductProjectionBySku(
        productQuery.skus[0],
        locale,
        distributionChannelId,
        storeKey,
        accountGroupIds,
      );
    }

    throw new Error('No product query parameters provided');
  }

  // --------------------------------------------------------------------------
  // queryCategories — with optional store scoping
  // --------------------------------------------------------------------------

  async queryCategories(categoryQuery: CategoryQuery): Promise<{
    items: CTCategory[];
    total: number;
    count: number;
  }> {
    const locale = getLocale(this.session);
    const limit = categoryQuery.limit ?? 24;
    const where: string[] = [];

    if (categoryQuery.slug) {
      where.push(`slug(${locale.language}="${categoryQuery.slug}")`);
    }

    if (categoryQuery.parentId) {
      where.push(`parent(id="${categoryQuery.parentId}")`);
    }

    // Scope categories to those with products in the store
    const storeKey = categoryQuery.storeKey ?? this.session.storeKey;
    if (storeKey) {
      const storeId = await this.getStoreId(storeKey);
      if (storeId) {
        const categoryIds = await this.getCategoryIdsForStore(storeId);
        if (categoryIds?.length) {
          where.push(`id in ("${categoryIds.join('","')}")`);
        }
      }
    }

    const response = await apiRoot
      .categories()
      .get({
        queryArgs: {
          limit,
          where: where.length > 0 ? where : undefined,
          expand: ['ancestors[*]', 'parent'],
          sort: 'orderHint asc',
        },
      })
      .execute();

    return {
      total: response.body.total ?? 0,
      count: response.body.count ?? 0,
      items: response.body.results,
    };
  }

  // --------------------------------------------------------------------------
  // Private: fetch category IDs that have products in a store
  // --------------------------------------------------------------------------

  private async getCategoryIdsForStore(storeId: string): Promise<string[] | undefined> {
    const response = await apiRoot
      .products()
      .search()
      .post({
        body: {
          query: {
            exact: {
              field: 'stores',
              value: storeId,
            },
          },
          facets: [
            {
              distinct: {
                name: 'categoriesSubTree',
                field: 'categoriesSubTree',
                level: 'products',
                limit: 200,
              },
            },
          ],
        } as any,
      })
      .execute();

    const facet = (response.body as any).facets?.find((f: any) => f.name === 'categoriesSubTree');
    if (!facet?.buckets) return undefined;
    return (facet.buckets as any[]).filter((b) => b.count > 0).map((b) => b.key as string);
  }

  // --------------------------------------------------------------------------
  // Private: store ID lookup (cached)
  // --------------------------------------------------------------------------

  private async getStoreId(storeKey: string): Promise<string | undefined> {
    if (storeIdCache.has(storeKey)) return storeIdCache.get(storeKey);
    try {
      const store = await apiRoot.stores().withKey({ key: storeKey }).get().execute();
      storeIdCache.set(storeKey, store.body.id);
      return store.body.id;
    } catch {
      return undefined;
    }
  }

  // --------------------------------------------------------------------------
  // Private: product projection fetchers
  // --------------------------------------------------------------------------

  private async fetchProductProjectionsByIds(
    productIds: string[],
    locale: Locale,
    distributionChannelId?: string,
    storeKey?: string,
    accountGroupIds?: string[],
  ): Promise<ProductProjection[]> {
    if (!productIds.length) return [];

    const queryArgs: Record<string, any> = {
      where: `id in ("${productIds.join('","')}")`,
      limit: productIds.length,
      priceCurrency: locale.currency,
      priceCountry: locale.country,
      expand: PRODUCT_PROJECTION_EXPANDS,
    };

    if (distributionChannelId) queryArgs.priceChannel = distributionChannelId;
    if (storeKey) queryArgs.storeProjection = storeKey;
    if (accountGroupIds?.length) queryArgs.priceCustomerGroupAssignments = accountGroupIds;

    const response = await apiRoot.productProjections().get({ queryArgs }).execute();
    return response.body.results;
  }

  private async fetchProductProjectionById(
    productId: string,
    locale: Locale,
    distributionChannelId?: string,
    storeKey?: string,
    accountGroupIds?: string[],
  ): Promise<ProductProjection> {
    const queryArgs: Record<string, any> = {
      priceCurrency: locale.currency,
      priceCountry: locale.country,
      expand: PRODUCT_PROJECTION_EXPANDS,
    };

    if (distributionChannelId) queryArgs.priceChannel = distributionChannelId;
    if (storeKey) queryArgs.storeProjection = storeKey;
    if (accountGroupIds?.length) queryArgs.priceCustomerGroupAssignments = accountGroupIds;

    const response = await apiRoot
      .productProjections()
      .withId({ ID: productId })
      .get({ queryArgs })
      .execute();

    return response.body;
  }

  private async fetchProductProjectionByKey(
    key: string,
    locale: Locale,
    distributionChannelId?: string,
    storeKey?: string,
    accountGroupIds?: string[],
  ): Promise<ProductProjection> {
    const queryArgs: Record<string, any> = {
      priceCurrency: locale.currency,
      priceCountry: locale.country,
      expand: PRODUCT_PROJECTION_EXPANDS,
    };

    if (distributionChannelId) queryArgs.priceChannel = distributionChannelId;
    if (storeKey) queryArgs.storeProjection = storeKey;
    if (accountGroupIds?.length) queryArgs.priceCustomerGroupAssignments = accountGroupIds;

    const response = await apiRoot
      .productProjections()
      .withKey({ key })
      .get({ queryArgs })
      .execute();

    return response.body;
  }

  private async fetchProductProjectionBySku(
    sku: string,
    locale: Locale,
    distributionChannelId?: string,
    storeKey?: string,
    accountGroupIds?: string[],
  ): Promise<ProductProjection> {
    const queryArgs: Record<string, any> = {
      where: `masterVariant(sku="${sku}") or variants(sku="${sku}")`,
      limit: 1,
      priceCurrency: locale.currency,
      priceCountry: locale.country,
      expand: PRODUCT_PROJECTION_EXPANDS,
    };

    if (distributionChannelId) queryArgs.priceChannel = distributionChannelId;
    if (storeKey) queryArgs.storeProjection = storeKey;
    if (accountGroupIds?.length) queryArgs.priceCustomerGroupAssignments = accountGroupIds;

    const response = await apiRoot.productProjections().get({ queryArgs }).execute();
    const product = response.body.results?.[0];
    if (!product) throw new Error(`Product with SKU '${sku}' not found`);
    return product;
  }
}
