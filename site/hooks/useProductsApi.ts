export interface ProductSkuData {
  id: string;
  name: any;
  variant: {
    id: number;
    price?: any;
    images?: { url: string }[];
    availableQuantity?: number | null;
    isOnStock?: boolean;
  };
}

export async function lookupProductBySku(sku: string): Promise<ProductSkuData | null> {
  const res = await fetch(`/api/products/sku?sku=${encodeURIComponent(sku)}`);
  if (!res.ok) return null;
  const data = await res.json();
  return data.product ?? null;
}
