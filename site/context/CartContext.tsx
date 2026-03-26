'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import useSWR from 'swr';
import type { Cart } from '@/lib/types';
import { useBusinessUnit } from './BusinessUnitContext';
import { KEY_CART } from '@/lib/cache-keys';
import {
  cartFetcher,
  createCartRequest,
  addCartItemRequest,
  updateCartItemRequest,
  removeCartItemRequest,
  applyDiscountCodeRequest,
} from '@/hooks/useCartApi';

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
  const [miniCartOpen, setMiniCartOpen] = useState(false);
  const [mutating, setMutating] = useState(false);

  const { data: cart = null, isLoading, mutate } = useSWR<Cart | null>(
    currentBusinessUnit ? KEY_CART : null,
    cartFetcher,
    { revalidateOnFocus: false },
  );

  const itemCount = useMemo(
    () =>
      cart?.lineItems?.reduce((sum, item) => sum + item.quantity, 0) ?? 0,
    [cart],
  );

  const fetchCart = useCallback(async () => {
    await mutate();
  }, [mutate]);

  const ensureCart = useCallback(async (): Promise<Cart> => {
    if (cart) return cart;
    const newCart = await createCartRequest();
    await mutate(newCart, { revalidate: false });
    return newCart;
  }, [cart, mutate]);

  const addItem = useCallback(
    async (productId: string, variantId: number, quantity: number) => {
      try {
        setMutating(true);
        await ensureCart();
        const updated = await addCartItemRequest(productId, variantId, quantity);
        await mutate(updated, { revalidate: false });
      } finally {
        setMutating(false);
      }
    },
    [ensureCart, mutate],
  );

  const addItemWithRecurrence = useCallback(
    async (productId: string, variantId: number, quantity: number, recurrencePolicyId: string) => {
      try {
        setMutating(true);
        await ensureCart();
        const updated = await addCartItemRequest(productId, variantId, quantity, recurrencePolicyId);
        await mutate(updated, { revalidate: false });
      } finally {
        setMutating(false);
      }
    },
    [ensureCart, mutate],
  );

  const updateQuantity = useCallback(
    async (lineItemId: string, quantity: number) => {
      try {
        setMutating(true);
        const updated = await updateCartItemRequest(lineItemId, quantity);
        await mutate(updated, { revalidate: false });
      } finally {
        setMutating(false);
      }
    },
    [mutate],
  );

  const removeItem = useCallback(async (lineItemId: string) => {
    try {
      setMutating(true);
      const updated = await removeCartItemRequest(lineItemId);
      await mutate(updated, { revalidate: false });
    } finally {
      setMutating(false);
    }
  }, [mutate]);

  const applyDiscountCode = useCallback(async (code: string) => {
    try {
      setMutating(true);
      const updated = await applyDiscountCodeRequest(code);
      await mutate(updated, { revalidate: false });
    } finally {
      setMutating(false);
    }
  }, [mutate]);

  const openMiniCart = useCallback(() => setMiniCartOpen(true), []);
  const closeMiniCart = useCallback(() => setMiniCartOpen(false), []);

  const value = useMemo<CartContextValue>(
    () => ({
      cart,
      itemCount,
      loading: isLoading || mutating,
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
      isLoading,
      mutating,
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
