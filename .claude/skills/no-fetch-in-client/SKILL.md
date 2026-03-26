# No fetch() in Client Components

## Rule

**Never call `fetch('/api/*')` directly inside a client component or context provider.**

All raw API calls belong in `site/hooks/` as plain async functions. Client components and context providers call those functions — they never construct `fetch` calls themselves.

---

## Why

- Keeps API contracts (URLs, methods, headers, error handling) in one place
- Context providers are client components; the same rule applies to them
- Makes API functions independently testable and reusable
- Prevents duplication when the same endpoint is called from multiple places

---

## Pattern: API hook files

### Where they live

```
site/hooks/useAuthApi.ts          ← auth endpoints
site/hooks/useBusinessUnitApi.ts  ← business-unit endpoints
site/hooks/useCartApi.ts          ← cart endpoints
site/hooks/<resource>Api.ts       ← follow this naming convention
```

### What goes in them

Plain `async` functions — **not** React hooks — that own the fetch call, error handling, and response parsing.

```ts
// site/hooks/useCartApi.ts
import type { Cart } from '@/lib/types';

export async function cartFetcher(): Promise<Cart | null> {
  const res = await fetch('/api/cart');
  if (!res.ok) return null;
  const data = await res.json();
  return data.cart ?? data ?? null;
}

export async function addCartItemRequest(
  productId: string,
  variantId: number,
  quantity: number,
): Promise<Cart> {
  const res = await fetch('/api/cart/items', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId, variantId, quantity }),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message ?? 'Failed to add item');
  }
  const data = await res.json();
  return data.cart ?? data;
}
```

### How contexts use them

Import the functions; never re-implement the fetch logic.

```ts
// site/context/CartContext.tsx
import { cartFetcher, addCartItemRequest } from '@/hooks/useCartApi';

// SWR fetcher:
const { data: cart, mutate } = useSWR(KEY_CART, cartFetcher, { revalidateOnFocus: false });

// Mutation:
const addItem = useCallback(async (productId, variantId, quantity) => {
  const updated = await addCartItemRequest(productId, variantId, quantity);
  await mutate(updated, { revalidate: false });
}, [mutate]);
```

---

## Naming conventions

| File | Contents |
|------|----------|
| `use<Resource>Api.ts` | Plain async fetch functions for one API resource |
| `use<Resource>.ts` | SWR hooks that components call directly |

- Fetcher functions: `<resource>Fetcher` (e.g. `cartFetcher`, `meFetcher`)
- Mutation functions: `<verb><Resource>Request` (e.g. `addCartItemRequest`, `loginRequest`)
- Return the parsed response object on success; throw `Error` on failure

---

## Checklist

- [ ] No `fetch('/api/...')` calls inside `context/*.tsx` files
- [ ] No `fetch('/api/...')` calls inside page or component files
- [ ] New API call → add a function to the appropriate `*Api.ts` hook file
- [ ] New resource → create `site/hooks/use<Resource>Api.ts`
- [ ] Error handling: throw `new Error(data.message ?? 'Fallback message')` so callers can catch
