import type {
  ProductSearchFacetDistinctValue,
  ProductSearchFacetRangesValue,
  ProductSearchFacetCountValue,
  ProductSearchFacetStatsValue,
  ProductProjection,
} from '@commercetools/platform-sdk';

// ---------------------------------------------------------------------------
// Filter / facet types
// ---------------------------------------------------------------------------

export enum FilterTypes {
  TERM = 'term',
  ENUM = 'enum',
  BOOLEAN = 'boolean',
  RANGE = 'range',
}

export interface Filter {
  identifier: string;
  type: FilterTypes;
}

export interface TermFilter extends Filter {
  type: FilterTypes.TERM | FilterTypes.ENUM;
  terms?: string[];
}

export interface BooleanFilter extends Filter {
  type: FilterTypes.BOOLEAN;
  /** ['true'] | ['false'] */
  terms?: string[];
}

export interface RangeFilter extends Filter {
  type: FilterTypes.RANGE;
  min?: number;
  max?: number;
}

export type Facet = TermFilter | BooleanFilter | RangeFilter;

// ---------------------------------------------------------------------------
// Sort
// ---------------------------------------------------------------------------

export type SortOrder = 'asc' | 'desc';

// ---------------------------------------------------------------------------
// Facet configuration (matches multitenant FacetConfiguration structure)
// FE-only display fields (label, uiType, etc.) are stripped before sending to CT.
// ---------------------------------------------------------------------------

export interface FacetDisplayConfig {
  label: string;
  uiType?: string;
  customComponent?: string;
  /** Maps enum/lenum keys to human-readable labels. */
  valueLabels?: Record<string, string>;
}

export type FacetConfiguration = FacetDisplayConfig &
  (
    | { distinct: ProductSearchFacetDistinctValue }
    | { ranges: ProductSearchFacetRangesValue }
    | { count: ProductSearchFacetCountValue }
    | { stats: ProductSearchFacetStatsValue }
  );

// ---------------------------------------------------------------------------
// Locale
// ---------------------------------------------------------------------------

export interface Locale {
  language: string;
  country: string;
  currency: string;
}

// ---------------------------------------------------------------------------
// ProductQuery
// ---------------------------------------------------------------------------

export interface ProductQuery {
  /** Full-text search term */
  query?: string | Record<string, string>;
  limit?: number;
  /** Cursor-based pagination: "offset:{n}" */
  cursor?: string;
  /** CT category IDs to filter by (categoriesSubTree) */
  categories?: string[];
  /** Applied attribute / price filters */
  filters?: Filter[];
  /** Facets with optional selected values (drive post-filter per facet) */
  facets?: Facet[];
  /** Facet configurations that define which facets to request from CT */
  facetConfigurations?: FacetConfiguration[];
  skus?: string[];
  productIds?: string[];
  productKeys?: string[];
  productRefs?: string[];
  productTypeId?: string;
  /** Product selection ID from session */
  productSelectionId?: string;
  /** Store key from session (resolved to storeId before calling search factory) */
  storeKey?: string;
  /** Resolved store with storeId (set by ProductApi before calling factory) */
  store?: { storeId?: string; key?: string };
  distributionChannelId?: string;
  supplyChannelId?: string;
  accountGroupIds?: string[];
  /** Sort: { [fieldName]: 'asc' | 'desc' } */
  sortAttributes?: Record<string, SortOrder>;
}

// ---------------------------------------------------------------------------
// CategoryQuery
// ---------------------------------------------------------------------------

export interface CategoryQuery {
  slug?: string;
  parentId?: string;
  /** When provided, categories are scoped to products in this store */
  storeKey?: string;
  limit?: number;
  cursor?: string;
}

// ---------------------------------------------------------------------------
// Result types
// ---------------------------------------------------------------------------

export interface ProductPaginatedResult {
  total: number;
  count: number;
  /** Raw CT ProductProjection objects */
  items: ProductProjection[];
  /** Raw CT facet result objects */
  facets: unknown[];
  previousCursor?: string;
  nextCursor?: string;
  query: ProductQuery;
}
