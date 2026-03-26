import type { Cart } from '@/lib/types';

export async function cartFetcher(): Promise<Cart | null> {
  const res = await fetch('/api/cart');
  if (!res.ok) return null;
  const data = await res.json();
  const c = data.cart !== undefined ? data.cart : data;
  return c || null;
}

export async function createCartRequest(): Promise<Cart> {
  const res = await fetch('/api/cart', { method: 'POST' });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message ?? 'Failed to create cart');
  }
  const data = await res.json();
  return data.cart ?? data;
}

export async function addCartItemRequest(
  productId: string,
  variantId: number,
  quantity: number,
  recurrencePolicyId?: string,
): Promise<Cart> {
  const res = await fetch('/api/cart/items', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId, variantId, quantity, ...(recurrencePolicyId ? { recurrencePolicyId } : {}) }),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message ?? 'Failed to add item');
  }
  const data = await res.json();
  return data.cart ?? data;
}

export async function updateCartItemRequest(
  lineItemId: string,
  quantity: number,
): Promise<Cart> {
  const res = await fetch(`/api/cart/items/${lineItemId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ quantity }),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message ?? 'Failed to update quantity');
  }
  const data = await res.json();
  return data.cart ?? data;
}

export async function removeCartItemRequest(lineItemId: string): Promise<Cart> {
  const res = await fetch(`/api/cart/items/${lineItemId}`, { method: 'DELETE' });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message ?? 'Failed to remove item');
  }
  const data = await res.json();
  return data.cart ?? data;
}

export async function applyDiscountCodeRequest(code: string): Promise<Cart> {
  const res = await fetch('/api/cart/discount-code', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message ?? 'Failed to apply discount code');
  }
  const data = await res.json();
  return data.cart ?? data;
}
