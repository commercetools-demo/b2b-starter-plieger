export const KEY_RECURRING_ORDERS = 'recurring-orders';
export function keyRecurringOrder(id: string) {
  return `recurring-order-${id}`;
}

export const KEY_RECURRENCE_POLICIES = 'recurrence-policies';

export const KEY_AUTH_ME = 'auth-me';
export const KEY_BUSINESS_UNITS = 'business-units';
export const KEY_CART = 'cart';

export const KEY_ORDERS = 'orders';
export function keyOrder(id: string) { return `order-${id}`; }

export const KEY_PURCHASE_LISTS = 'purchase-lists';
export function keyPurchaseList(id: string) { return `purchase-list-${id}`; }

export const KEY_WISHLISTS = 'wishlists';
export function keyWishlist(id: string) { return `wishlist-${id}`; }

export const KEY_QUOTES = 'quotes';
export function keyQuote(id: string) { return `quote-${id}`; }
export const KEY_QUOTE_REQUESTS = 'quote-requests';
export function keyQuoteRequest(id: string) { return `quote-request-${id}`; }

export const KEY_APPROVAL_RULES = 'approval-rules';
export function keyApprovalRule(id: string) { return `approval-rule-${id}`; }
export const KEY_APPROVAL_FLOWS = 'approval-flows';
export function keyApprovalFlow(id: string) { return `approval-flow-${id}`; }

export const KEY_ACCOUNT = 'account';

export function keySearchSuggestions(q: string) { return `search-suggestions-${q}`; }
export function keyProducts(body: object) { return ['products', JSON.stringify(body)] as const; }
export function keyRatings(productId: string, sort: string) { return `ratings-${productId}-${sort}`; }
