/**
 * ProductSearchFactory — builds a CT ProductSearchRequest from a ProductQuery.
 *
 * Ported from multitenant-frontend/frontend-app/lib/utils/product-search-query-factory.ts
 * with @Types/* imports replaced by local types.
 */
import type { FacetConfiguration, Facet, ProductQuery, RangeFilter, TermFilter, Locale } from './product-types';
import { FilterTypes } from './product-types';
import type {
  SearchAnyValue,
  SearchExactExpression,
  ProductSearchFacetExpression,
  SearchNumberRangeExpression,
  SearchNumberRangeValue,
  SearchOrExpression,
  SearchQuery,
  SearchQueryExpression,
  ProductSearchRequest,
  SearchWildCardExpression,
  _ProductSearchFacetExpression,
  ProductSearchFacetCountExpression,
  ProductSearchFacetDistinctExpression,
  ProductSearchFacetRangesExpression,
  ProductSearchFacetStatsExpression,
  _SearchQuery,
  SearchSorting,
} from '@commercetools/platform-sdk';

const LOCALIZED_FULLTEXT_QUERY_FIELDS = ['name', 'description', 'slug', 'searchKeywords'];
const KEYWORD_EXACT_QUERY_FIELDS = ['variants.sku'];

type Writeable<T> = { -readonly [P in keyof T]: Writeable<T[P]> };

type ProductSearchFactoryUtilMethod = (
  commercetoolsProductSearchRequest: ProductSearchRequest,
  productQuery: ProductQuery,
  locale: Locale,
) => ProductSearchRequest;

export class ProductSearchFactory {
  static createCommercetoolsProductSearchRequestFromProductQuery(
    productQuery: ProductQuery,
    facetConfigurations: FacetConfiguration[],
    locale: Locale,
    productIdField: string = 'key',
  ): ProductSearchRequest {
    let commercetoolsProductSearchRequest = ProductSearchFactory.initializeProductSearchRequestObject(productQuery);

    commercetoolsProductSearchRequest = this.applyQueryString(commercetoolsProductSearchRequest, productQuery, locale);
    commercetoolsProductSearchRequest = this.applyQueryCategories(
      commercetoolsProductSearchRequest,
      productQuery,
      locale,
    );
    commercetoolsProductSearchRequest = this.applyQueryProducts(
      commercetoolsProductSearchRequest,
      productQuery,
      productIdField,
    );
    commercetoolsProductSearchRequest = this.applyQueryProductTypeId(commercetoolsProductSearchRequest, productQuery);
    commercetoolsProductSearchRequest = this.applyStore(commercetoolsProductSearchRequest, productQuery);
    commercetoolsProductSearchRequest = this.applyProductSelection(
      commercetoolsProductSearchRequest,
      productQuery,
      locale,
    );
    commercetoolsProductSearchRequest = this.applyQuerySKUs(commercetoolsProductSearchRequest, productQuery, locale);
    commercetoolsProductSearchRequest = this.applyFilters(
      commercetoolsProductSearchRequest,
      productQuery,
      facetConfigurations,
      locale,
    );
    commercetoolsProductSearchRequest = this.applyFacets(
      commercetoolsProductSearchRequest,
      productQuery,
      facetConfigurations,
      locale,
    );
    commercetoolsProductSearchRequest = this.applySortAttributes(
      commercetoolsProductSearchRequest,
      productQuery,
      facetConfigurations,
      locale,
    );
    commercetoolsProductSearchRequest = this.rearrangeProductSearchQuery(commercetoolsProductSearchRequest);
    commercetoolsProductSearchRequest = this.rearrangeProductSearchPostFilter(commercetoolsProductSearchRequest);
    commercetoolsProductSearchRequest = this.rearrangeProductSearchFacets(commercetoolsProductSearchRequest);
    commercetoolsProductSearchRequest = this.applyDefaultQueryIfEmpty(
      commercetoolsProductSearchRequest,
      productQuery,
      locale,
    );

    return commercetoolsProductSearchRequest;
  }

  private static initializeProductSearchRequestObject(productQuery: ProductQuery): ProductSearchRequest {
    const commercetoolsProductSearchRequest: Writeable<ProductSearchRequest> = {
      query: {},
      markMatchingVariants: true,
      postFilter: {},
    };

    commercetoolsProductSearchRequest.limit = +(productQuery.limit ?? 24);
    commercetoolsProductSearchRequest.offset = this.getOffsetFromCursor(productQuery.cursor ?? '');

    return commercetoolsProductSearchRequest as ProductSearchRequest;
  }

  private static rearrangeProductSearchQuery(
    commercetoolsProductSearchRequest: ProductSearchRequest,
  ): ProductSearchRequest {
    const query = this.rearrangeSearchQuery(commercetoolsProductSearchRequest.query);
    return { ...commercetoolsProductSearchRequest, query };
  }

  private static rearrangeProductSearchPostFilter(
    commercetoolsProductSearchRequest: ProductSearchRequest,
  ): ProductSearchRequest {
    const postFilter = this.rearrangeSearchQuery(commercetoolsProductSearchRequest.postFilter);
    return { ...commercetoolsProductSearchRequest, postFilter };
  }

  private static rearrangeProductSearchFacets(
    commercetoolsProductSearchRequest: ProductSearchRequest,
  ): ProductSearchRequest {
    const facets = commercetoolsProductSearchRequest.facets?.map((facet) => {
      switch (true) {
        case 'count' in facet:
          (facet as Writeable<ProductSearchFacetCountExpression>).count.filter = this.rearrangeSearchQuery(
            (facet as ProductSearchFacetCountExpression).count.filter,
          );
          break;
        case 'distinct' in facet:
          (facet as Writeable<ProductSearchFacetDistinctExpression>).distinct.filter = this.rearrangeSearchQuery(
            (facet as ProductSearchFacetDistinctExpression).distinct.filter,
          );
          break;
        case 'ranges' in facet:
          (facet as Writeable<ProductSearchFacetRangesExpression>).ranges.filter = this.rearrangeSearchQuery(
            (facet as ProductSearchFacetRangesExpression).ranges.filter,
          );
      }

      return facet;
    });

    return {
      ...commercetoolsProductSearchRequest,
      facets,
    };
  }

  private static rearrangeSearchQuery(searchQuery: _SearchQuery | undefined): _SearchQuery | undefined {
    if (!searchQuery) {
      return undefined;
    }

    const intermediateValues: {
      orLength: number;
      andLength: number;
      orList: SearchQuery[];
      andList: SearchQuery[];
    } = {
      orLength: 0,
      andLength: 0,
      orList: [],
      andList: [],
    };

    if ('or' in searchQuery) {
      intermediateValues.orLength = searchQuery.or.length || 0;
      intermediateValues.orList = searchQuery.or;
    }

    if ('and' in searchQuery) {
      intermediateValues.andLength = searchQuery.and.length || 0;
      intermediateValues.andList = searchQuery.and;
    }

    if (intermediateValues.orLength === 0 && intermediateValues.andLength === 0) {
      return undefined;
    }

    if (intermediateValues.orLength === 1 && intermediateValues.andLength === 1) {
      const orField =
        'exact' in intermediateValues.orList[0]
          ? (intermediateValues.orList[0] as SearchExactExpression).exact?.field
          : undefined;
      const andField =
        'exact' in intermediateValues.andList[0]
          ? (intermediateValues.andList[0] as SearchExactExpression).exact?.field
          : 'range' in intermediateValues.andList[0]
            ? (intermediateValues.andList[0] as SearchNumberRangeExpression).range?.field
            : undefined;

      if (orField === andField) {
        return intermediateValues.andList[0] as _SearchQuery;
      }

      return {
        and: [intermediateValues.andList[0], intermediateValues.orList[0]] as SearchQuery,
      };
    }

    if (intermediateValues.orLength === 1 && intermediateValues.andLength > 0) {
      return {
        and: [...intermediateValues.andList, intermediateValues.orList[0]] as SearchQuery,
      };
    }

    if (intermediateValues.andLength === 1 && intermediateValues.orLength > 0) {
      return {
        or: [...intermediateValues.orList, intermediateValues.andList[0]] as SearchQuery,
      };
    }

    if (intermediateValues.andLength === 0) {
      if (intermediateValues.orLength === 1) {
        return intermediateValues.orList[0] as _SearchQuery;
      }
      return {
        or: intermediateValues.orList,
      };
    }

    if (intermediateValues.orLength === 0) {
      if (intermediateValues.andLength === 1) {
        return intermediateValues.andList[0] as _SearchQuery;
      }
      return {
        and: intermediateValues.andList,
      };
    }

    return searchQuery;
  }

  // ---------------------------------------------------------------------------
  // Push helpers
  // ---------------------------------------------------------------------------

  private static pushToProductSearchRequestQueryAndExpression(
    commercetoolsProductSearchRequest: ProductSearchRequest,
    expression: SearchQuery | SearchQuery[],
  ): ProductSearchRequest {
    if (commercetoolsProductSearchRequest.query && 'and' in commercetoolsProductSearchRequest.query) {
      if (Array.isArray(expression)) {
        commercetoolsProductSearchRequest.query.and.push(...expression);
      } else {
        commercetoolsProductSearchRequest.query.and.push(expression);
      }
    } else {
      if (Array.isArray(expression)) {
        (commercetoolsProductSearchRequest.query as Writeable<SearchQuery>) = {
          ...commercetoolsProductSearchRequest.query,
          and: [...expression],
        };
      } else {
        (commercetoolsProductSearchRequest.query as Writeable<SearchQuery>) = {
          ...commercetoolsProductSearchRequest.query,
          and: [expression],
        };
      }
    }
    return commercetoolsProductSearchRequest;
  }

  private static pushToProductSearchRequestQueryOrExpression(
    commercetoolsProductSearchRequest: ProductSearchRequest,
    expression: SearchQuery | SearchQuery[],
  ): ProductSearchRequest {
    if (commercetoolsProductSearchRequest.query && 'or' in commercetoolsProductSearchRequest.query) {
      if (Array.isArray(expression)) {
        commercetoolsProductSearchRequest.query.or.push(...expression);
      } else {
        commercetoolsProductSearchRequest.query.or.push(expression);
      }
    } else {
      if (Array.isArray(expression)) {
        (commercetoolsProductSearchRequest.query as Writeable<SearchQuery>) = {
          ...commercetoolsProductSearchRequest.query,
          or: [...expression],
        };
      } else {
        (commercetoolsProductSearchRequest.query as Writeable<SearchQuery>) = {
          ...commercetoolsProductSearchRequest.query,
          or: [expression],
        };
      }
    }
    return commercetoolsProductSearchRequest;
  }

  private static pushToProductSearchRequestPostFilterAndExpression(
    commercetoolsProductSearchRequest: ProductSearchRequest,
    expression: SearchQuery | SearchQuery[],
  ): ProductSearchRequest {
    if (commercetoolsProductSearchRequest.postFilter && 'and' in commercetoolsProductSearchRequest.postFilter) {
      if (Array.isArray(expression)) {
        commercetoolsProductSearchRequest.postFilter.and.push(...expression);
      } else {
        commercetoolsProductSearchRequest.postFilter.and.push(expression);
      }
    } else {
      if (Array.isArray(expression)) {
        (commercetoolsProductSearchRequest.postFilter as Writeable<SearchQuery>) = {
          ...commercetoolsProductSearchRequest.postFilter,
          and: [...expression],
        };
      } else {
        (commercetoolsProductSearchRequest.postFilter as Writeable<SearchQuery>) = {
          ...commercetoolsProductSearchRequest.postFilter,
          and: [expression],
        };
      }
    }
    return commercetoolsProductSearchRequest;
  }

  private static pushToProductSearchFacetExpressionFilterAndExpression(
    productSearchFacetExpression: Writeable<ProductSearchFacetExpression>,
    expression: SearchQuery | SearchQuery[],
  ): ProductSearchFacetExpression {
    switch (true) {
      case 'count' in productSearchFacetExpression:
        (productSearchFacetExpression as Writeable<ProductSearchFacetCountExpression>).count.filter =
          this.pushToSearchQueryAndExpression(
            (productSearchFacetExpression as ProductSearchFacetCountExpression).count.filter,
            expression,
          );
        break;
      case 'distinct' in productSearchFacetExpression:
        (productSearchFacetExpression as Writeable<ProductSearchFacetDistinctExpression>).distinct.filter =
          this.pushToSearchQueryAndExpression(
            (productSearchFacetExpression as ProductSearchFacetDistinctExpression).distinct.filter,
            expression,
          );
        break;
      case 'ranges' in productSearchFacetExpression:
        (productSearchFacetExpression as Writeable<ProductSearchFacetRangesExpression>).ranges.filter =
          this.pushToSearchQueryAndExpression(
            (productSearchFacetExpression as ProductSearchFacetRangesExpression).ranges.filter,
            expression,
          );
        break;
    }

    return productSearchFacetExpression;
  }

  private static pushToSearchQueryAndExpression(
    filter: _SearchQuery | undefined,
    expression: SearchQuery | SearchQuery[],
  ): _SearchQuery | undefined {
    if (filter && 'and' in filter) {
      if (Array.isArray(expression)) {
        filter.and.push(...expression);
      } else {
        filter.and.push(expression);
      }
    } else {
      if (Array.isArray(expression)) {
        (filter as Writeable<SearchQuery>) = {
          ...filter,
          and: [...expression],
        };
      } else {
        (filter as Writeable<SearchQuery>) = {
          ...filter,
          and: [expression],
        };
      }
    }

    return filter;
  }

  // ---------------------------------------------------------------------------
  // Query builders
  // ---------------------------------------------------------------------------

  private static applyQueryString: ProductSearchFactoryUtilMethod = (
    commercetoolsProductSearchRequest: ProductSearchRequest,
    productQuery: ProductQuery,
    locale: Locale,
  ) => {
    if (productQuery.query) {
      let queryValue: string | undefined;

      switch (true) {
        case typeof productQuery.query === 'string':
          queryValue = productQuery.query as string;
          break;
        case typeof productQuery.query === 'object':
          queryValue =
            (productQuery.query as Record<string, string>)[locale.language] ??
            Object.values(productQuery.query as Record<string, string>)[0];
          break;
        default:
          break;
      }

      if (!queryValue) return commercetoolsProductSearchRequest;

      const productSearchOrExpression: SearchOrExpression = {
        or: [],
      };
      LOCALIZED_FULLTEXT_QUERY_FIELDS.forEach((field) => {
        const fullTextQuery: SearchWildCardExpression = {
          wildcard: {
            field,
            language: locale.language,
            value: `*${queryValue}*`,
            caseInsensitive: true,
          },
        };
        productSearchOrExpression.or.push(fullTextQuery);
      });

      KEYWORD_EXACT_QUERY_FIELDS.forEach((field) => {
        const exactFieldQuery: SearchExactExpression = {
          exact: {
            field,
            value: queryValue,
            caseInsensitive: true,
          },
        };
        productSearchOrExpression.or.push(exactFieldQuery);
      });

      commercetoolsProductSearchRequest = this.pushToProductSearchRequestQueryAndExpression(
        commercetoolsProductSearchRequest,
        productSearchOrExpression,
      );
    }

    return commercetoolsProductSearchRequest;
  };

  private static applyDefaultQueryIfEmpty: ProductSearchFactoryUtilMethod = (
    commercetoolsProductSearchRequest: ProductSearchRequest,
    productQuery: ProductQuery,
    locale: Locale,
  ) => {
    const isProductSearchQueryEmpty =
      !commercetoolsProductSearchRequest.query || Object.keys(commercetoolsProductSearchRequest.query).length === 0;

    if (!productQuery.query && isProductSearchQueryEmpty) {
      const productSearchWildCardExpression: SearchWildCardExpression = {
        wildcard: {
          field: 'name',
          language: locale.language,
          value: '*',
        },
      };
      commercetoolsProductSearchRequest = {
        ...commercetoolsProductSearchRequest,
        query: productSearchWildCardExpression,
      };
    }
    return commercetoolsProductSearchRequest;
  };

  private static applyQueryCategories: ProductSearchFactoryUtilMethod = (
    commercetoolsProductSearchRequest: ProductSearchRequest,
    productQuery: ProductQuery,
  ) => {
    if (productQuery.categories?.length) {
      const productSearchExactExpressions: SearchExactExpression[] = [];
      productQuery.categories.forEach((categoryId) => {
        productSearchExactExpressions.push({
          exact: {
            field: 'categoriesSubTree',
            value: categoryId,
          },
        });
      });
      commercetoolsProductSearchRequest = this.pushToProductSearchRequestQueryAndExpression(
        commercetoolsProductSearchRequest,
        productSearchExactExpressions,
      );
    }
    return commercetoolsProductSearchRequest;
  };

  private static applyProductSelection: ProductSearchFactoryUtilMethod = (
    commercetoolsProductSearchRequest: ProductSearchRequest,
    productQuery: ProductQuery,
  ) => {
    if (productQuery.productSelectionId) {
      const productSearchExactExpressions: SearchExactExpression[] = [
        {
          exact: {
            field: 'productSelections',
            value: productQuery.productSelectionId,
          },
        },
        {
          exact: {
            field: 'variants.productSelections',
            value: productQuery.productSelectionId,
          },
        },
      ];

      commercetoolsProductSearchRequest = this.pushToProductSearchRequestQueryAndExpression(
        commercetoolsProductSearchRequest,
        productSearchExactExpressions,
      );
    }
    return commercetoolsProductSearchRequest;
  };

  private static applyQueryProducts(
    commercetoolsProductSearchRequest: ProductSearchRequest,
    productQuery: ProductQuery,
    productIdField: string,
  ): ProductSearchRequest {
    if (productQuery.productRefs?.length) {
      switch (productIdField) {
        case 'id':
          if (!productQuery.productIds) productQuery.productIds = [];
          productQuery.productIds.push(...productQuery.productRefs);
          break;
        case 'key':
        default:
          if (!productQuery.productKeys) productQuery.productKeys = [];
          productQuery.productKeys.push(...productQuery.productRefs);
          break;
      }
    }

    if (productQuery.productIds?.length) {
      const productSearchExactExpressions: SearchExactExpression[] = productQuery.productIds.map((productId) => ({
        exact: { field: 'id', value: productId },
      }));
      commercetoolsProductSearchRequest = this.pushToProductSearchRequestQueryOrExpression(
        commercetoolsProductSearchRequest,
        productSearchExactExpressions,
      );
    }

    if (productQuery.productKeys?.length) {
      const productSearchExactExpressions: SearchExactExpression[] = productQuery.productKeys.map((key) => ({
        exact: { field: 'key', value: key },
      }));
      commercetoolsProductSearchRequest = this.pushToProductSearchRequestQueryOrExpression(
        commercetoolsProductSearchRequest,
        productSearchExactExpressions,
      );
    }

    return commercetoolsProductSearchRequest;
  }

  private static applyStore(
    commercetoolsProductSearchRequest: ProductSearchRequest,
    productQuery: ProductQuery,
  ): ProductSearchRequest {
    if (productQuery.store?.storeId) {
      commercetoolsProductSearchRequest = this.pushToProductSearchRequestQueryAndExpression(
        commercetoolsProductSearchRequest,
        {
          exact: {
            field: 'stores',
            value: productQuery.store.storeId,
          },
        },
      );
    }

    return commercetoolsProductSearchRequest;
  }

  private static applyQueryProductTypeId(
    commercetoolsProductSearchRequest: ProductSearchRequest,
    productQuery: ProductQuery,
  ): ProductSearchRequest {
    if (productQuery.productTypeId) {
      commercetoolsProductSearchRequest = this.pushToProductSearchRequestQueryAndExpression(
        commercetoolsProductSearchRequest,
        {
          exact: {
            field: 'productType',
            value: productQuery.productTypeId,
          },
        },
      );
    }
    return commercetoolsProductSearchRequest;
  }

  private static applyQuerySKUs: ProductSearchFactoryUtilMethod = (
    commercetoolsProductSearchRequest: ProductSearchRequest,
    productQuery: ProductQuery,
  ) => {
    if (productQuery.skus?.length) {
      const productSearchExactExpressions: SearchExactExpression[] = productQuery.skus.map((sku) => ({
        exact: { field: 'variants.sku', value: sku },
      }));
      commercetoolsProductSearchRequest = this.pushToProductSearchRequestQueryOrExpression(
        commercetoolsProductSearchRequest,
        productSearchExactExpressions,
      );
    }
    return commercetoolsProductSearchRequest;
  };

  // ---------------------------------------------------------------------------
  // Filters
  // ---------------------------------------------------------------------------

  private static applyFilters(
    commercetoolsProductSearchRequest: ProductSearchRequest,
    productQuery: ProductQuery,
    facetConfigurations: FacetConfiguration[],
    locale: Locale,
  ): ProductSearchRequest {
    if (productQuery.filters?.length) {
      const productSearchExpressions: (SearchExactExpression | SearchNumberRangeExpression)[] = [];

      productQuery.filters.forEach((filter) => {
        const { fieldType, language, field } = this.resolveFilterFieldInfo(
          filter.identifier,
          facetConfigurations,
          locale,
        );

        switch (filter.type) {
          case FilterTypes.TERM:
          case FilterTypes.ENUM:
            (filter as TermFilter).terms?.forEach((term) => {
              productSearchExpressions.push({
                exact: {
                  field,
                  value: term,
                  ...(fieldType ? { fieldType } : {}),
                  ...(language ? { language } : {}),
                } as SearchAnyValue,
              });
            });
            break;

          case FilterTypes.BOOLEAN:
            productSearchExpressions.push({
              exact: {
                field,
                value: (filter as TermFilter).terms?.[0]?.toString().toLowerCase() === 'true',
                ...(fieldType ? { fieldType } : {}),
                ...(language ? { language } : {}),
              } as SearchAnyValue,
            });
            break;

          case FilterTypes.RANGE:
            productSearchExpressions.push({
              range: {
                field,
                ...(fieldType ? { fieldType } : {}),
                ...(language ? { language } : {}),
                gte: (filter as RangeFilter).min,
                lte: (filter as RangeFilter).max,
              } as SearchNumberRangeValue,
            });
            break;
        }
      });

      commercetoolsProductSearchRequest = this.pushToProductSearchRequestQueryAndExpression(
        commercetoolsProductSearchRequest,
        productSearchExpressions,
      );
    }

    return commercetoolsProductSearchRequest;
  }

  // ---------------------------------------------------------------------------
  // Sorting
  // ---------------------------------------------------------------------------

  private static applySortAttributes(
    commercetoolsProductSearchRequest: Writeable<ProductSearchRequest>,
    productQuery: ProductQuery,
    facetConfigurations: FacetConfiguration[],
    locale: Locale,
  ): ProductSearchRequest {
    const searchSortings: SearchSorting[] = [];

    if (productQuery.sortAttributes !== undefined) {
      Object.entries(productQuery.sortAttributes).forEach(([sortAttributeKey, sortAttributeOrder]) => {
        let searchSorting: SearchSorting = {
          order: sortAttributeOrder,
          field: sortAttributeKey,
        };

        switch (true) {
          case sortAttributeKey === 'price':
            searchSorting = { ...searchSorting, field: 'variants.prices.centAmount' };
            break;
          case sortAttributeKey === 'description' || sortAttributeKey === 'name' || sortAttributeKey === 'slug':
            searchSorting = { ...searchSorting, language: locale.language };
            break;
          default:
            break;
        }

        const { fieldType, language, field } = this.resolveFilterFieldInfo(
          sortAttributeKey,
          facetConfigurations,
          locale,
        );
        if (field !== sortAttributeKey) {
          searchSorting = {
            ...searchSorting,
            field,
            ...(fieldType ? { fieldType } : {}),
            ...(language ? { language } : {}),
          };
        }

        searchSortings.push(searchSorting);
      });
    } else {
      searchSortings.push({ order: 'desc', field: 'score' }, { order: 'desc', field: 'id' });
    }

    commercetoolsProductSearchRequest.sort = searchSortings;

    return commercetoolsProductSearchRequest as ProductSearchRequest;
  }

  // ---------------------------------------------------------------------------
  // Facets
  // ---------------------------------------------------------------------------

  /**
   * Strip FE-only display fields (label, uiType, etc.) and return CT facet expressions.
   */
  static toCtExpressions(facetConfigurations: FacetConfiguration[]): ProductSearchFacetExpression[] {
    return facetConfigurations.map((config) => {
      const { label, uiType, customComponent, valueLabels, ...expression } = config as any;
      return expression as ProductSearchFacetExpression;
    });
  }

  private static applyFacets(
    commercetoolsProductSearchRequest: ProductSearchRequest,
    productQuery: ProductQuery,
    facetConfigurations: FacetConfiguration[],
    locale: Locale,
  ): ProductSearchRequest {
    const productSearchFacetExpressions = this.toCtExpressions(facetConfigurations);

    if (!productSearchFacetExpressions.length) {
      return commercetoolsProductSearchRequest;
    }

    const mutableRequest = commercetoolsProductSearchRequest as Writeable<ProductSearchRequest>;

    if (productQuery.facets?.length) {
      productQuery.facets.forEach((queryFacet) => {
        const productSearchFacetExpression = productSearchFacetExpressions.find(
          (expr) => this.getProductSearchFacetIdentifier(expr) === queryFacet.identifier,
        );

        if (!productSearchFacetExpression) return;

        let searchQuery: _SearchQuery | undefined;

        switch (queryFacet.type) {
          case FilterTypes.TERM:
          case FilterTypes.ENUM:
            searchQuery = this.getSearchQueryFilterExpressionFromTermFacet(
              productSearchFacetExpression,
              queryFacet,
              locale,
            );
            break;
          case FilterTypes.BOOLEAN:
            searchQuery = this.getSearchQueryFilterExpressionFromBooleanFacet(
              productSearchFacetExpression,
              queryFacet,
              locale,
            );
            break;
          case FilterTypes.RANGE:
            searchQuery = this.getSearchQueryFilterExpressionFromRangeFacet(
              productSearchFacetExpression,
              queryFacet,
              locale,
              productQuery.distributionChannelId,
            );
            break;
        }

        if (!searchQuery) return;

        mutableRequest.postFilter = this.pushToPostFilterAndExpression(mutableRequest.postFilter, searchQuery);

        productSearchFacetExpressions.forEach((expr) => {
          if (this.getProductSearchFacetIdentifier(expr) !== queryFacet.identifier) {
            this.pushToProductSearchFacetExpressionFilterAndExpression(expr, searchQuery!);
          }
        });
      });
    }

    mutableRequest.facets = productSearchFacetExpressions;

    return mutableRequest as ProductSearchRequest;
  }

  private static pushToPostFilterAndExpression(
    filter: _SearchQuery | undefined,
    expression: _SearchQuery,
  ): _SearchQuery {
    if (filter && 'and' in filter) {
      filter.and.push(expression as SearchQuery);
      return filter;
    }
    return { ...filter, and: [expression as SearchQuery] } as _SearchQuery;
  }

  // ---------------------------------------------------------------------------
  // FacetConfiguration helpers
  // ---------------------------------------------------------------------------

  private static resolveFilterFieldInfo(
    identifier: string,
    facetConfigurations: FacetConfiguration[],
    _locale: Locale,
  ): { field: string; fieldType?: string; language?: string } {
    for (const config of facetConfigurations) {
      const name = this.getFacetConfigName(config);
      if (name !== identifier) continue;

      if ('distinct' in config) {
        return {
          field: config.distinct.field,
          fieldType: config.distinct.fieldType,
          language: config.distinct.language,
        };
      }
      if ('ranges' in config) {
        return {
          field: config.ranges.field,
          fieldType: config.ranges.fieldType,
          language: config.ranges.language,
        };
      }
      if ('stats' in config) {
        return {
          field: (config as any).stats.field,
          fieldType: (config as any).stats.fieldType,
        };
      }
      if ('count' in config) {
        return { field: (config as any).count.name };
      }
    }
    return { field: identifier };
  }

  static getFacetConfigName(config: FacetConfiguration): string {
    if ('distinct' in config) return config.distinct.name;
    if ('ranges' in config) return config.ranges.name;
    if ('count' in config) return (config as any).count.name;
    if ('stats' in config) return (config as any).stats.name;
    return '';
  }

  private static getProductSearchFacetIdentifier(facet: _ProductSearchFacetExpression): string {
    return (
      ('count' in facet && (facet as ProductSearchFacetCountExpression).count?.name) ||
      ('distinct' in facet && (facet as ProductSearchFacetDistinctExpression).distinct?.name) ||
      ('ranges' in facet && (facet as ProductSearchFacetRangesExpression).ranges?.name) ||
      ('stats' in facet && (facet as ProductSearchFacetStatsExpression).stats?.name) ||
      ''
    );
  }

  private static getFacetExpressionFieldAndType(
    facet: _ProductSearchFacetExpression,
  ): { field: string; fieldType?: string; language?: string } {
    if ('distinct' in facet) {
      const d = (facet as ProductSearchFacetDistinctExpression).distinct;
      return { field: d.field, fieldType: d.fieldType, language: d.language };
    }
    if ('ranges' in facet) {
      const r = (facet as ProductSearchFacetRangesExpression).ranges;
      return { field: r.field, fieldType: r.fieldType, language: r.language };
    }
    if ('stats' in facet) {
      const s = (facet as ProductSearchFacetStatsExpression).stats;
      return { field: s.field, fieldType: s.fieldType };
    }
    return { field: '' };
  }

  // ---------------------------------------------------------------------------
  // Facet-based filter expression builders
  // ---------------------------------------------------------------------------

  private static getSearchQueryFilterExpressionFromRangeFacet(
    searchFacetExpression: _ProductSearchFacetExpression,
    queryFacet: Facet,
    locale: Locale,
    priceChannel?: string,
  ): SearchQueryExpression {
    const { field, fieldType, language } = this.getFacetExpressionFieldAndType(searchFacetExpression);
    const searchQueryExpressions: SearchQueryExpression[] = [];

    searchQueryExpressions.push({
      range: {
        field,
        ...(fieldType ? { fieldType } : {}),
        ...(language ? { language } : {}),
        gte: (queryFacet as RangeFilter).min,
        lte: (queryFacet as RangeFilter).max,
      } as SearchNumberRangeValue,
    });

    if (queryFacet.identifier === 'variants.prices') {
      searchQueryExpressions.push({
        exact: {
          field: `${queryFacet.identifier}.currencyCode`,
          value: locale.currency,
        },
      });

      if (priceChannel) {
        searchQueryExpressions.push({
          exact: {
            field: `${queryFacet.identifier}.channel`,
            value: priceChannel,
          },
        });
      }
    }

    if (searchQueryExpressions.length === 1) {
      return searchQueryExpressions[0];
    }

    return { and: searchQueryExpressions.map((e) => e) };
  }

  private static getSearchQueryFilterExpressionFromBooleanFacet(
    searchFacetExpression: _ProductSearchFacetExpression,
    queryFacet: Facet,
    _locale: Locale,
  ): SearchQueryExpression {
    const { field, fieldType, language } = this.getFacetExpressionFieldAndType(searchFacetExpression);
    return {
      exact: {
        field,
        value: (queryFacet as TermFilter).terms?.[0]?.toString().toLowerCase() === 'true',
        ...(fieldType ? { fieldType } : {}),
        ...(language ? { language } : {}),
      } as SearchAnyValue,
    };
  }

  private static getSearchQueryFilterExpressionFromTermFacet(
    searchFacetExpression: _ProductSearchFacetExpression,
    queryFacet: Facet,
    _locale: Locale,
  ): SearchQueryExpression {
    const { field, fieldType, language } = this.getFacetExpressionFieldAndType(searchFacetExpression);
    const searchQueryExpressions: SearchQueryExpression[] = [];

    (queryFacet as TermFilter).terms?.forEach((term) =>
      searchQueryExpressions.push({
        exact: {
          field,
          value: term,
          ...(fieldType ? { fieldType } : {}),
          ...(language ? { language } : {}),
        } as SearchAnyValue,
      }),
    );

    if (searchQueryExpressions.length === 1) {
      return searchQueryExpressions[0];
    }

    return { or: searchQueryExpressions.map((e) => e) };
  }

  // ---------------------------------------------------------------------------
  // Misc
  // ---------------------------------------------------------------------------

  private static getOffsetFromCursor(cursor: string): number {
    if (cursor === undefined) return 0;
    const offsetMatch = cursor.match(/(?<=offset:).+/);
    return offsetMatch !== null ? +Object.values(offsetMatch)[0] : 0;
  }
}
