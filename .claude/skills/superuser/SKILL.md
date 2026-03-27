---
name: superuser
description: How to implement a Superuser role in this B2B storefront — lets privileged associates view all store carts, create merchant-originated carts, switch active carts, and reassign carts to other associates.
---

# Implementing Superuser Role

Superusers are associates whose CT associate-role has the key `superuser`. They can:
- See all active carts in their business unit's store
- Switch the active cart to any of them
- Create new merchant-originated carts
- Reassign the current cart to another associate

The implementation follows the existing patterns in this repo: session JWT, `lib/ct/` functions, `app/api/` routes, SWR hooks, and React Context.

---

## Step 1 — Extend `SessionData` type

**File:** `site/lib/types.ts`

Add `isSuperuser` to the `SessionData` interface. Search for `SessionData` — it lives near the bottom of the file with the other session-related types, or check `lib/session.ts` imports.

```typescript
export interface SessionData {
  // ... existing fields ...
  isSuperuser?: boolean;
}
```

Also extend the `Cart` type to carry the fields returned by the superuser cart query (CT expands `createdBy.customer`):

```typescript
export interface Cart {
  // ... existing fields ...
  origin?: 'Customer' | 'Merchant' | 'Quote';
  createdByEmail?: string;    // populated from expand in superuser queries
  createdByName?: string;     // "First Last" from the associate
}
```

---

## Step 2 — Detect superuser role at login

**File:** `site/app/api/auth/login/route.ts`

After `const businessUnits = await getBusinessUnitsForAssociate(customer.id)`, check whether the logged-in customer has a `superuser` role in any of their BU associates:

```typescript
const SUPERUSER_ROLE_KEY = 'superuser';

const isSuperuser = businessUnits.some((bu) =>
  bu.associates?.some(
    (associate) =>
      associate.customer.id === customer.id &&
      associate.associateRoleAssignments.some(
        (a) => a.associateRole.key === SUPERUSER_ROLE_KEY,
      ),
  ),
);
```

Then include it in the `setSession` call:

```typescript
await setSession(response, {
  customerId: customer.id,
  customerEmail: customer.email,
  customerFirstName: customer.firstName,
  customerLastName: customer.lastName,
  isSuperuser,          // ← add this
  ...storeSession,
});
```

**Why here:** Login is the right place — the BU data is already fetched, the flag is set once per session instead of re-checked on every request, and it can be revoked by logging out.

---

## Step 3 — Add CT library functions

**File:** `site/lib/ct/cart.ts`

Add three functions after the existing exports. All use the project-level `apiRoot` (not the as-associate chain) because superusers need to read carts that don't belong to them.

### 3a. Fetch all active carts in a store

```typescript
export async function getAllSuperuserCarts(
  businessUnitKey: string,
  storeKey: string,
): Promise<Cart[]> {
  const response = await apiRoot
    .carts()
    .get({
      queryArgs: {
        where: [
          `cartState="Active"`,
          `store(key="${storeKey}")`,
          `businessUnit(key="${businessUnitKey}")`,
        ],
        limit: 20,
        sort: 'createdAt desc',
        expand: ['createdBy.customer'],
      },
    })
    .execute();

  return response.body.results.map((ct) => ({
    id: ct.id,
    version: ct.version,
    customerId: ct.customerId,
    businessUnit: ct.businessUnit as any,
    store: ct.store as any,
    lineItems: ct.lineItems as any,
    totalPrice: ct.totalPrice as any,
    cartState: ct.cartState as any,
    origin: ct.origin as any,
    createdByEmail: (ct.createdBy as any)?.customer?.email,
    createdByName: [
      (ct.createdBy as any)?.customer?.firstName,
      (ct.createdBy as any)?.customer?.lastName,
    ]
      .filter(Boolean)
      .join(' '),
  }));
}
```

> **Note:** The `expand: ['createdBy.customer']` avoids N+1 queries — one request returns creator info for all carts.

### 3b. Create a merchant-originated cart

```typescript
export async function createSuperuserCart(
  associateId: string,
  businessUnitKey: string,
  storeKey: string,
  currency = 'USD',
  country = 'US',
) {
  const response = await apiRoot
    .asAssociate()
    .withAssociateIdValue({ associateId })
    .inBusinessUnitKeyWithBusinessUnitKeyValue({ businessUnitKey })
    .carts()
    .post({
      body: {
        currency,
        country,
        origin: 'Merchant',        // ← marks this as superuser-created
        businessUnit: { key: businessUnitKey, typeId: 'business-unit' },
        store: { key: storeKey, typeId: 'store' },
      },
    })
    .execute();
  return response.body;
}
```

> Setting `origin: 'Merchant'` is the CT-native way to mark a cart as merchant-created. Do **not** set `customerId` — merchant carts are owner-less until reassigned.

### 3c. Reassign cart to another customer

```typescript
export async function reassignCart(
  cartId: string,
  version: number,
  associateId: string,
  businessUnitKey: string,
  targetCustomerId: string,
) {
  const response = await apiRoot
    .asAssociate()
    .withAssociateIdValue({ associateId })
    .inBusinessUnitKeyWithBusinessUnitKeyValue({ businessUnitKey })
    .carts()
    .withId({ ID: cartId })
    .post({
      body: {
        version,
        actions: [{ action: 'setCustomerId', customerId: targetCustomerId }],
      },
    })
    .execute();
  return response.body;
}
```

---

## Step 4 — Add cache keys

**File:** `site/lib/cache-keys.ts`

```typescript
export const KEY_SUPERUSER_STATUS = 'superuser-status';
export const KEY_SUPERUSER_CARTS  = 'superuser-carts';
```

---

## Step 5 — Create API routes

### 5a. Status + carts — `GET /api/superuser/status`

**File:** `site/app/api/superuser/status/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { getAllSuperuserCarts } from '@/lib/ct/cart';

export async function GET() {
  const session = await getSession();

  if (!session?.isSuperuser) {
    return NextResponse.json({ isSuperuser: false, carts: [] });
  }

  const { businessUnitKey, storeKey } = session;
  if (!businessUnitKey || !storeKey) {
    return NextResponse.json({ isSuperuser: true, carts: [] });
  }

  const carts = await getAllSuperuserCarts(businessUnitKey, storeKey);
  return NextResponse.json({ isSuperuser: true, carts });
}
```

> Returns `{ isSuperuser: false, carts: [] }` for non-superusers — no 403, no information leakage.

### 5b. Create merchant cart — `POST /api/superuser/carts`

**File:** `site/app/api/superuser/carts/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { getSession, setSession } from '@/lib/session';
import { createSuperuserCart } from '@/lib/ct/cart';

export async function POST() {
  const session = await getSession();

  if (!session?.isSuperuser || !session.customerId || !session.businessUnitKey || !session.storeKey) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const cart = await createSuperuserCart(
    session.customerId,
    session.businessUnitKey,
    session.storeKey,
    session.currency,
  );

  const response = NextResponse.json({ cart }, { status: 201 });
  await setSession(response, { ...session, cartId: cart.id });
  return response;
}
```

### 5c. Switch active cart — `POST /api/superuser/carts/switch`

**File:** `site/app/api/superuser/carts/switch/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getSession, setSession } from '@/lib/session';
import { getCartById } from '@/lib/ct/cart';

export async function POST(request: NextRequest) {
  const session = await getSession();

  if (!session?.isSuperuser || !session.customerId || !session.businessUnitKey) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { cartId } = await request.json();
  if (!cartId) {
    return NextResponse.json({ error: 'cartId is required' }, { status: 400 });
  }

  // Verify the cart exists and belongs to this BU
  const cart = await getCartById(cartId, session.customerId, session.businessUnitKey, session.storeKey!);

  const response = NextResponse.json({ cart });
  await setSession(response, { ...session, cartId: cart.id });
  return response;
}
```

> Updating `cartId` in the session is all it takes to "switch" the active cart. The existing `/api/cart` GET will now return the switched-to cart.

### 5d. Reassign cart — `POST /api/superuser/carts/[id]/reassign`

**File:** `site/app/api/superuser/carts/[id]/reassign/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { getCartById, reassignCart } from '@/lib/ct/cart';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();

  if (!session?.isSuperuser || !session.customerId || !session.businessUnitKey) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id: cartId } = await params;
  const { targetCustomerId } = await request.json();

  if (!targetCustomerId) {
    return NextResponse.json({ error: 'targetCustomerId is required' }, { status: 400 });
  }

  const current = await getCartById(cartId, session.customerId, session.businessUnitKey, session.storeKey!);
  const updated = await reassignCart(
    cartId,
    current.version,
    session.customerId,
    session.businessUnitKey,
    targetCustomerId,
  );

  return NextResponse.json({ cart: updated });
}
```

---

## Step 6 — Create the Superuser Context

**File:** `site/context/SuperuserContext.tsx`

Follows the same pattern as `AuthContext.tsx` — SWR fetch on mount, React Context, exported hook.

```typescript
'use client';

import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react';
import useSWR, { useSWRConfig } from 'swr';
import type { Cart } from '@/lib/types';
import { KEY_SUPERUSER_STATUS, KEY_CART } from '@/lib/cache-keys';

export interface SuperuserStatus {
  isSuperuser: boolean;
  carts: Cart[];
}

interface SuperuserContextValue {
  superuserStatus: SuperuserStatus;
  loading: boolean;
  refreshCarts: () => Promise<void>;
  switchCart: (cartId: string) => Promise<void>;
  createMerchantCart: () => Promise<void>;
  reassignCart: (cartId: string, targetCustomerId: string) => Promise<void>;
}

async function superuserStatusFetcher(): Promise<SuperuserStatus> {
  const res = await fetch('/api/superuser/status');
  if (!res.ok) return { isSuperuser: false, carts: [] };
  return res.json();
}

const SuperuserContext = createContext<SuperuserContextValue | undefined>(undefined);

export function SuperuserProvider({ children }: { children: ReactNode }) {
  const { mutate: mutateGlobal } = useSWRConfig();

  const { data, isLoading, mutate } = useSWR<SuperuserStatus>(
    KEY_SUPERUSER_STATUS,
    superuserStatusFetcher,
    { revalidateOnFocus: false },
  );

  const superuserStatus: SuperuserStatus = data ?? { isSuperuser: false, carts: [] };

  /** Invalidate the cart cache so CartContext picks up the switched cart. */
  const invalidateCart = useCallback(() => {
    mutateGlobal(KEY_CART);
  }, [mutateGlobal]);

  const refreshCarts = useCallback(async () => {
    await mutate();
  }, [mutate]);

  const switchCart = useCallback(
    async (cartId: string) => {
      const res = await fetch('/api/superuser/carts/switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cartId }),
      });
      if (!res.ok) throw new Error('Failed to switch cart');
      invalidateCart();
      // Full reload ensures all components (Header, Cart page, etc.) reflect the new cart.
      window.location.replace(window.location.pathname);
    },
    [invalidateCart],
  );

  const createMerchantCart = useCallback(async () => {
    const res = await fetch('/api/superuser/carts', { method: 'POST' });
    if (!res.ok) throw new Error('Failed to create cart');
    await mutate();   // refresh cart list
    invalidateCart(); // refresh active cart in CartContext
  }, [mutate, invalidateCart]);

  const reassignCart = useCallback(
    async (cartId: string, targetCustomerId: string) => {
      const res = await fetch(`/api/superuser/carts/${cartId}/reassign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetCustomerId }),
      });
      if (!res.ok) throw new Error('Failed to reassign cart');
      await mutate();
      invalidateCart();
    },
    [mutate, invalidateCart],
  );

  const value = useMemo<SuperuserContextValue>(
    () => ({
      superuserStatus,
      loading: isLoading,
      refreshCarts,
      switchCart,
      createMerchantCart,
      reassignCart,
    }),
    [superuserStatus, isLoading, refreshCarts, switchCart, createMerchantCart, reassignCart],
  );

  return <SuperuserContext.Provider value={value}>{children}</SuperuserContext.Provider>;
}

export function useSuperuser(): SuperuserContextValue {
  const ctx = useContext(SuperuserContext);
  if (!ctx) throw new Error('useSuperuser must be used within SuperuserProvider');
  return ctx;
}
```

---

## Step 7 — Wire SuperuserProvider into the layout and place UI

**File:** `site/app/[locale]/layout.tsx`

Add `SuperuserProvider` **inside** `AuthProvider` (it needs auth to exist) but **outside** `CartProvider` (CartContext uses `mutateGlobal(KEY_CART)` which SuperuserContext triggers). Also import `SuperuserBanner` and render it between `<Header />` and `<main>`:

```typescript
import { SuperuserProvider } from '@/context/SuperuserContext';
import { SuperuserBanner } from '@/components/superuser/SuperuserBanner';

// In the JSX:
<AuthProvider>
  <SuperuserProvider>
    <BusinessUnitProvider>
      <CartProvider>
        <Header />
        <SuperuserBanner />          {/* ← amber banner shown to superusers */}
        <main className="flex-1">{children}</main>
        <Footer />
      </CartProvider>
    </BusinessUnitProvider>
  </SuperuserProvider>
</AuthProvider>
```

---

## Step 8 — Create UI components

### 8a. Cart browser (dropdown to switch carts)

**File:** `site/components/superuser/CartBrowser.tsx`

```typescript
'use client';

import { useSuperuser } from '@/context/SuperuserContext';
import { useCart } from '@/context/CartContext';

export function CartBrowser() {
  const { superuserStatus, switchCart, createMerchantCart } = useSuperuser();
  const { cart: currentCart } = useCart();

  if (!superuserStatus.isSuperuser) return null;

  return (
    <div className="rounded border p-3 text-sm">
      <p className="mb-2 font-semibold">All store carts</p>
      <ul className="space-y-1">
        {superuserStatus.carts.map((c) => (
          <li key={c.id}>
            <button
              disabled={c.id === currentCart?.id}
              onClick={() => switchCart(c.id)}
              className="text-left disabled:opacity-50"
            >
              {c.origin === 'Merchant'
                ? 'Merchant cart'
                : `Cart of ${c.createdByName || c.createdByEmail || c.customerId}`}
              {' — '}
              {c.totalPrice.currencyCode}{' '}
              {(c.totalPrice.centAmount / 100).toFixed(2)}
              {c.id === currentCart?.id && ' (active)'}
            </button>
          </li>
        ))}
      </ul>
      <button onClick={createMerchantCart} className="mt-3 underline text-sm">
        + Create new merchant cart
      </button>
    </div>
  );
}
```

### 8b. Reassign button (dropdown of associates)

**File:** `site/components/superuser/ReassignCartButton.tsx`

```typescript
'use client';

import { useSuperuser } from '@/context/SuperuserContext';
import { useCart } from '@/context/CartContext';
import { useBusinessUnit } from '@/context/BusinessUnitContext';

export function ReassignCartButton() {
  const { superuserStatus, reassignCart } = useSuperuser();
  const { cart } = useCart();
  const { currentBusinessUnit } = useBusinessUnit();

  if (!superuserStatus.isSuperuser || !cart || !currentBusinessUnit) return null;

  const options = currentBusinessUnit.associates.filter(
    (a) => a.customer.id !== cart.customerId,
  );

  if (options.length === 0) return null;

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!e.target.value) return;
    reassignCart(cart.id, e.target.value);
  };

  return (
    <select defaultValue="" onChange={handleChange} className="border rounded p-1 text-sm">
      <option value="" disabled>Reassign cart to&hellip;</option>
      {options.map((a) => (
        <option key={a.customer.id} value={a.customer.id}>
          {a.customer.firstName} {a.customer.lastName}
          {a.customer.email ? ` (${a.customer.email})` : ''}
        </option>
      ))}
    </select>
  );
}
```

Place it in `site/app/[locale]/cart/page.tsx` between the **Request Quote** button and **Continue Shopping**:

```typescript
import { ReassignCartButton } from '@/components/superuser/ReassignCartButton';

// In the JSX (inside the order summary card, after the action buttons):
<div className="mt-3">
  <ReassignCartButton />
</div>

<div className="mt-4 text-center">
  <Button variant="ghost" size="sm" href={localePath('/products')}>Continue Shopping</Button>
</div>
```

### 8c. Superuser mode banner

**File:** `site/components/superuser/SuperuserBanner.tsx`

Shown globally below the Header via `layout.tsx` (see Step 7):

```typescript
'use client';

import { useSuperuser } from '@/context/SuperuserContext';

export function SuperuserBanner() {
  const { superuserStatus } = useSuperuser();
  if (!superuserStatus.isSuperuser) return null;
  return (
    <div className="bg-amber-100 border-l-4 border-amber-500 px-4 py-2 text-sm text-amber-800">
      You are viewing this page as a <strong>superuser</strong>.
    </div>
  );
}
```

### 8d. Cart caret in Header

**File:** `site/components/layout/Header.tsx`

Add imports at the top:

```typescript
import { useSuperuser } from '@/context/SuperuserContext';
import { CartBrowser } from '@/components/superuser/CartBrowser';
```

Add state and ref inside `Header()`:

```typescript
const { superuserStatus } = useSuperuser();
const [cartBrowserOpen, setCartBrowserOpen] = useState(false);
const cartBrowserRef = useRef<HTMLDivElement>(null);
```

Add close-on-outside-click inside the existing `handleClickOutside` handler:

```typescript
if (cartBrowserRef.current && !cartBrowserRef.current.contains(e.target as Node)) {
  setCartBrowserOpen(false);
}
```

Replace the cart button JSX with a wrapper containing the cart icon and a caret:

```typescript
{/* Cart button + superuser caret */}
<div className="relative flex items-center" ref={cartBrowserRef}>
  <button
    onClick={openMiniCart}
    className="relative rounded-md p-2 text-slate-600 hover:bg-slate-100"
    aria-label="Open cart"
  >
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
    </svg>
    {itemCount > 0 && (
      <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs font-medium text-white">
        {itemCount > 99 ? '99+' : itemCount}
      </span>
    )}
  </button>
  {superuserStatus.isSuperuser && (
    <>
      <button
        onClick={() => setCartBrowserOpen((o) => !o)}
        className="ml-0.5 rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
        aria-label="Browse all carts"
      >
        <ChevronDown />
      </button>
      {cartBrowserOpen && (
        <div className="absolute right-0 top-full z-40 mt-1 w-80 rounded-md border border-slate-200 bg-white shadow-lg">
          <CartBrowser />
        </div>
      )}
    </>
  )}
</div>
```

---

## Step 9 — Add i18n strings

**Files:** `site/messages/en-US.json` and `site/messages/de-DE.json`

Add a `superuser` namespace:

```json
{
  "superuser": {
    "banner": "You are viewing this page as a superuser.",
    "allCarts": "All store carts",
    "createMerchantCart": "Create new merchant cart",
    "merchantCart": "Merchant cart",
    "reassignTo": "Reassign cart to…",
    "cartOf": "Cart of {name}",
    "total": "Total"
  }
}
```

Then replace hardcoded strings in the components with `useTranslations('superuser')`.

---

## CT prerequisite: create the associate role

Before testing, create a CT associate role with key `superuser` in Merchant Center:

1. **Merchant Center → Business Units → Associate Roles → Create**
2. Key: `superuser`
3. Assign it at least: `ViewOthersCarts`, `UpdateOthersCarts`, `CreateOthersCarts`
4. Assign this role to your test user in their business unit

---

## Implementation checklist

- [ ] `lib/types.ts` — add `isSuperuser?: boolean` to `SessionData`, add `origin?` and `createdByEmail?` / `createdByName?` to `Cart`
- [ ] `app/api/auth/login/route.ts` — detect superuser role and store in session
- [ ] `lib/ct/cart.ts` — add `getAllSuperuserCarts`, `createSuperuserCart`, `reassignCart`
- [ ] `lib/cache-keys.ts` — add `KEY_SUPERUSER_STATUS` and `KEY_SUPERUSER_CARTS`
- [ ] `app/api/superuser/status/route.ts` — GET status + carts
- [ ] `app/api/superuser/carts/route.ts` — POST create merchant cart
- [ ] `app/api/superuser/carts/switch/route.ts` — POST switch active cart
- [ ] `app/api/superuser/carts/[id]/reassign/route.ts` — POST reassign
- [ ] `context/SuperuserContext.tsx` — provider + hook
- [ ] `app/[locale]/layout.tsx` — add `<SuperuserProvider>` and `<SuperuserBanner />` below `<Header />`
- [ ] `components/superuser/CartBrowser.tsx`
- [ ] `components/superuser/ReassignCartButton.tsx`
- [ ] `components/superuser/SuperuserBanner.tsx`
- [ ] `components/layout/Header.tsx` — add caret + `CartBrowser` dropdown next to cart icon
- [ ] `app/[locale]/cart/page.tsx` — add `<ReassignCartButton />` below Request Quote, above Continue Shopping
- [ ] `messages/en-US.json` and `de-DE.json` — add `superuser` namespace
- [ ] CT Merchant Center — create `superuser` associate role and assign to test user

---

## Key patterns to follow

| Pattern | Where used | Why |
|---|---|---|
| `getSession()` first in every route | All API routes | Session is the auth source of truth |
| Return `{ isSuperuser: false, carts: [] }` not 403 | `GET /api/superuser/status` | Avoids leaking privilege info to non-superusers |
| `setSession(response, { ...session, cartId })` | Switch + create cart routes | Session spread preserves all existing fields |
| `mutateGlobal(KEY_CART)` | After cart switch | Forces CartContext to refetch the new active cart |
| `window.location.replace(...)` after switch | `switchCart` in context | Full reload ensures all components see the new cart; can be scoped later |
| `origin: 'Merchant'` in cart draft | `createSuperuserCart` | CT-native way to mark merchant-created carts |
| Project-level `apiRoot.carts()` (not as-associate) | `getAllSuperuserCarts` | Superusers need to read carts they don't own |
| `expand: ['createdBy.customer']` | `getAllSuperuserCarts` | One query returns creator info — avoids N+1 |
