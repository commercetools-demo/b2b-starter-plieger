import { apiRoot } from './client';

export interface ReviewSummary {
  averageRating: number;
  totalReviews: number;
  distribution: Record<number, number>;
}

export async function getReviewsForProduct(
  productId: string,
  options: { limit?: number; offset?: number; sort?: 'latest' | 'highest' | 'lowest' } = {}
) {
  const { limit = 10, offset = 0, sort = 'latest' } = options;

  const sortParam =
    sort === 'highest' ? 'rating desc' :
    sort === 'lowest' ? 'rating asc' :
    'createdAt desc';

  const response = await (apiRoot as any)
    .reviews()
    .get({
      queryArgs: {
        where: `target(id="${productId}")`,
        limit,
        offset,
        sort: sortParam,
      },
    })
    .execute();

  const results = response.body.results;
  const total: number = response.body.total ?? 0;

  // Compute summary from all results (approximate for non-paginated)
  const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let ratingSum = 0;
  let ratingCount = 0;
  results.forEach((r: any) => {
    if (r.rating !== undefined && r.rating !== null) {
      const clipped = Math.min(5, Math.max(1, Math.round(r.rating)));
      distribution[clipped] = (distribution[clipped] ?? 0) + 1;
      ratingSum += r.rating;
      ratingCount++;
    }
  });

  const summary: ReviewSummary = {
    averageRating: ratingCount > 0 ? Math.round((ratingSum / ratingCount) * 10) / 10 : 0,
    totalReviews: total,
    distribution,
  };

  return { results, total, limit, offset, summary };
}

export async function createReview(
  productId: string,
  customerId: string,
  rating: number,
  text: string,
  title?: string
) {
  const response = await (apiRoot as any)
    .reviews()
    .post({
      body: {
        target: { id: productId, typeId: 'product' },
        rating,
        text,
        title,
        authorName: undefined,
        customer: { id: customerId, typeId: 'customer' },
      },
    })
    .execute();
  return response.body;
}
