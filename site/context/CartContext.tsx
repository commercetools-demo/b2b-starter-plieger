'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Cart } from '@/lib/types';
import { useBusinessUnit } from './BusinessUnitContext';

interface CartContextValue {
  cart: Cart | null;
  itemCount: number;
  loading: boolean;
  miniCartOpen: boolean;
  fetchCart: () => Promise<void>;
  addItem: (
    productId: string,
    variantId: number,
    quantity: number,
  ) => Promise<void>;
  addItemWithRecurrence: (
    productId: string,
    variantId: number,
    quantity: number,
    recurrencePolicyId: string,
  ) => Promise<void>;
  updateQuantity: (lineItemId: string, quantity: number) => Promise<void>;
  removeItem: (lineItemId: string) => Promise<void>;
  applyDiscountCode: (code: string) => Promise<void>;
  openMiniCart: () => void;
  closeMiniCart: () => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { currentBusinessUnit } = useBusinessUnit();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);
  const [miniCartOpen, setMiniCartOpen] = useState(false);

  const itemCount = useMemo(
    () =>
      cart?.lineItems?.reduce((sum, item) => sum + item.quantity, 0) ?? 0,
    [cart],
  );

  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/cart');
      if (res.ok) {
        const data = await res.json();
        // API returns { cart: ... } — unwrap it
        const c = data.cart !== undefined ? data.cart : data;
        setCart(c || null);
      } else if (res.status === 404) {
        setCart(null);
      }
    } catch {
      // Silently handle fetch errors — cart may not exist yet
    } finally {
      setLoading(false);
    }
  }, []);

  const ensureCart = useCallback(async (): Promise<Cart> => {
    if (cart) return cart;
    const res = await fetch('/api/cart', { method: 'POST' });
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.message ?? 'Failed to create cart');
    }
    const data = await res.json();
    const newCart: Cart = data.cart ?? data;
    setCart(newCart);
    return newCart;
  }, [cart]);

  const addItem = useCallback(
    async (productId: string, variantId: number, quantity: number) => {
      try {
        setLoading(true);
        await ensureCart();
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
        setCart(data.cart ?? data);
      } finally {
        setLoading(false);
      }
    },
    [ensureCart],
  );

  const addItemWithRecurrence = useCallback(
    async (productId: string, variantId: number, quantity: number, recurrencePolicyId: string) => {
      try {
        setLoading(true);
        await ensureCart();
        const res = await fetch('/api/cart/items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId, variantId, quantity, recurrencePolicyId }),
        });
        if (!res.ok) {
          const error = await res.json().catch(() => ({}));
          throw new Error(error.message ?? 'Failed to add item');
        }
        const data = await res.json();
        setCart(data.cart ?? data);
      } finally {
        setLoading(false);
      }
    },
    [ensureCart],
  );

  const updateQuantity = useCallback(
    async (lineItemId: string, quantity: number) => {
      try {
        setLoading(true);
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
        setCart(data.cart ?? data);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const removeItem = useCallback(async (lineItemId: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/cart/items/${lineItemId}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message ?? 'Failed to remove item');
      }
      const data = await res.json();
      setCart(data.cart ?? data);
    } finally {
      setLoading(false);
    }
  }, []);

  const applyDiscountCode = useCallback(async (code: string) => {
    try {
      setLoading(true);
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
      setCart(data.cart ?? data);
    } finally {
      setLoading(false);
    }
  }, []);

  const openMiniCart = useCallback(() => setMiniCartOpen(true), []);
  const closeMiniCart = useCallback(() => setMiniCartOpen(false), []);

  useEffect(() => {
    if (currentBusinessUnit) {
      fetchCart();
    } else {
      setCart(null);
    }
  }, [currentBusinessUnit, fetchCart]);

  const value = useMemo<CartContextValue>(
    () => ({
      cart,
      itemCount,
      loading,
      miniCartOpen,
      fetchCart,
      addItem,
      addItemWithRecurrence,
      updateQuantity,
      removeItem,
      applyDiscountCode,
      openMiniCart,
      closeMiniCart,
    }),
    [
      cart,
      itemCount,
      loading,
      miniCartOpen,
      fetchCart,
      addItem,
      addItemWithRecurrence,
      updateQuantity,
      removeItem,
      applyDiscountCode,
      openMiniCart,
      closeMiniCart,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
