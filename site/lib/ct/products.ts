import { apiRoot } from './client';

// Cache store distribution channels to avoid repeated lookups
const storeChannelCache = new Map<string, string>();

async function getDistributionChannelForStore(storeKey: string): Promise<string | undefined> {
  if (storeChannelCache.has(storeKey)) {
    return storeChannelCache.get(storeKey);
  }
  try {
    const store = await apiRoot
      .stores()
      .withKey({ key: storeKey })
      .get()
      .execute();
    const channelId = store.body.distributionChannels?.[0]?.id;
    if (channelId) {
      storeChannelCache.set(storeKey, channelId);
    }
    return channelId;
  } catch {
    return undefined;
  }
}

export async function searchProducts(options: {
  text?: string;
  categoryId?: string;
  limit?: number;
  offset?: number;
  sort?: string;
  priceCurrency?: string;
  priceCountry?: string;
  storeKey?: string;
  /** Attribute names to request distinct facets for */
  facets?: string[];
  /** Attribute value filters: { [attributeName]: values[] } */
  filters?: Record<string, string[]>;
} = {}) {
  const {
    text,
    categoryId,
    limit = 20,
    offset = 0,
    priceCurrency = 'USD',
    priceCountry = 'US',
    storeKey,
    facets: facetFields,
    filters,
  } = options;

  // Build the search query
  const queryExpressions: any[] = [];

  if (text) {
    queryExpressions.push({
      fullText: {
        field: 'name',
        language: 'en-US',
        value: text,
      },
    });
  }

  if (categoryId) {
    queryExpressions.push({
      exact: {
        field: 'categoriesSubTree',
        fieldType: 'keyword',
        values: [categoryId],
      },
    });
  }

  // Attribute filters from facet selections
  if (filters) {
    for (const [field, values] of Object.entries(filters)) {
      if (values.length > 0) {
        queryExpressions.push({
          exact: {
            field: `variants.attributes.${field}`,
            fieldType: 'text',
            values,
          },
        });
      }
    }
  }

  // Build projection parameters for price selection
  const productProjectionParameters: Record<string, unknown> = {
    priceCurrency,
    priceCountry,
    staged: false,
  };

  if (storeKey) {
    productProjectionParameters.storeProjection = storeKey;
    const channelId = await getDistributionChannelForStore(storeKey);
    if (channelId) {
      productProjectionParameters.priceChannel = channelId;
    }
  }

  const body: Record<string, unknown> = {
    limit,
    offset,
    productProjectionParameters,
  };

  if (queryExpressions.length === 1) {
    body.query = queryExpressions[0];
  } else if (queryExpressions.length > 1) {
    body.query = { and: queryExpressions };
  }

  // Add sort if provided
  if (options.sort && options.sort !== 'score') {
    const [field, order] = options.sort.split('-');
    if (field === 'price') {
      body.sort = [{ field: 'variants.prices.centAmount', order: order === 'desc' ? 'desc' : 'asc' }];
    } else if (field === 'name') {
      body.sort = [{ field: 'name.en-US', order: order === 'desc' ? 'desc' : 'asc' }];
    }
  }

  // Add facets if requested
  if (facetFields && facetFields.length > 0) {
    body.facets = facetFields.map((f) => ({
      distinct: {
        name: f,
        field: `variants.attributes.${f}`,
        fieldType: 'text',
      },
    }));
  }

  const response = await apiRoot
    .products()
    .search()
    .post({ body: body as any })
    .execute();

  // Map results to include the productProjection at the top level
  // so the frontend can consume them the same way as Product Projections
  const results = response.body.results.map((r: any) => r.productProjection ?? r);

  return {
    results,
    total: response.body.total,
    limit: response.body.limit,
    offset: response.body.offset,
    facets: (response.body as any).facets ?? [],
  };
}

export async function getProductBySlug(slug: string, locale = 'en-US', storeKey?: string) {
  const productProjectionParameters: Record<string, unknown> = {
    staged: false,
  };

  if (storeKey) {
    productProjectionParameters.storeProjection = storeKey;
    productProjectionParameters.priceCurrency = 'USD';
    productProjectionParameters.priceCountry = 'US';
    const channelId = await getDistributionChannelForStore(storeKey);
    if (channelId) {
      productProjectionParameters.priceChannel = channelId;
    }
  }

  const body: Record<string, unknown> = {
    limit: 1,
    query: {
      exact: {
        field: 'slug',
        language: locale,
        value: slug,
      },
    },
    productProjectionParameters,
  };

  const response = await apiRoot
    .products()
    .search()
    .post({ body: body as any })
    .execute();

  const result = response.body.results[0] as any;
  return result?.productProjection ?? result ?? null;
}

export async function getProductById(id: string) {
  const response = await apiRoot
    .productProjections()
    .withId({ ID: id })
    .get()
    .execute();
  return response.body;
}

export async function getCategories() {
  const response = await apiRoot
    .categories()
    .get({
      queryArgs: {
        limit: 500,
        sort: 'orderHint asc',
      },
    })
    .execute();
  return response.body.results;
}

export async function getCategoryBySlug(slug: string, locale = 'en-US') {
  const response = await apiRoot
    .categories()
    .get({
      queryArgs: {
        where: `slug(${locale}="${slug}")`,
        limit: 1,
      },
    })
    .execute();
  return response.body.results[0] || null;
}
