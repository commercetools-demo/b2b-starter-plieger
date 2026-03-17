'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import { Button } from '@/components/ui/Button';
import { AddToCartButton } from '@/components/product/AddToCartButton';
import { Select } from '@/components/ui/Select';
import { localizedString, formatMoney } from '@/lib/utils';

function formatAttributeValue(value: any): string {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'number') return String(value);
  if (typeof value === 'string') return value;
  // Enum: { key, label } or localized enum: { key, label: { "en-US": "..." } }
  if (value.label !== undefined) {
    return typeof value.label === 'object' ? localizedString(value.label) : String(value.label);
  }
  // Localized string: { "en-US": "text" }
  if (value['en-US'] || value['en']) {
    return localizedString(value);
  }
  // Money: { centAmount, currencyCode }
  if (value.centAmount !== undefined) {
    return formatMoney(value);
  }
  // Array of values
  if (Array.isArray(value)) {
    return value.map(formatAttributeValue).join(', ');
  }
  return String(value);
}

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { addToast } = useToast();
  const { isLoggedIn } = useAuth();
  const { hasAnyPermission } = usePermissions();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [purchaseLists, setPurchaseLists] = useState<any[]>([]);
  const [selectedList, setSelectedList] = useState('');
  const [addingToList, setAddingToList] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  const canUpdateLists = hasAnyPermission(['UpdateMyShoppingLists', 'UpdateOthersShoppingLists']);

  const [supplyChannelId, setSupplyChannelId] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/products/${slug}`)
      .then((res) => res.json())
      .then((data) => {
        setProduct(data.product ?? data);
        if (data.supplyChannelId) setSupplyChannelId(data.supplyChannelId);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  // Extract inventory from product variant availability using the store's supply channel
  const availability = product?.masterVariant?.availability;
  const channels = availability?.channels ?? {};
  const channelAvailability = supplyChannelId && channels[supplyChannelId]
    ? (channels[supplyChannelId] as any)
    : null;
  const inventoryQuantity: number | null = channelAvailability?.availableQuantity ?? null;
  const isOutOfStock = channelAvailability ? !channelAvailability.isOnStock || (channelAvailability.availableQuantity ?? 0) <= 0 : false;

  useEffect(() => {
    if (isLoggedIn && canUpdateLists) {
      fetch('/api/purchase-lists')
        .then((res) => res.json())
        .then((data) => setPurchaseLists(data.results ?? []))
        .catch(() => {});
    }
  }, [isLoggedIn, canUpdateLists]);

  const handleAddToList = async () => {
    if (!selectedList || !product) return;
    setAddingToList(true);
    try {
      await fetch(`/api/purchase-lists/${selectedList}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          variantId: product.masterVariant?.id ?? 1,
          quantity: 1,
        }),
      });
      addToast('Added to purchase list');
    } catch {
      addToast('Failed to add to purchase list');
    } finally {
      setAddingToList(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="animate-pulse grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="aspect-square bg-gray-200 rounded-xl" />
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
            <div className="h-6 bg-gray-200 rounded w-1/4" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-10 text-center">
        <h1 className="text-2xl font-bold mb-2">Product Not Found</h1>
        <p className="text-gray-600 mb-6">The product you are looking for does not exist.</p>
        <Button variant="primary" href="/products">Back to Products</Button>
      </div>
    );
  }

  const images = product.masterVariant?.images ?? [];
  // Prefer embedded price (from priceChannel selection), fall back to prices array
  const price = product.masterVariant?.price ?? product.masterVariant?.prices?.[0];
  const attributes = product.masterVariant?.attributes ?? [];
  const name = localizedString(product.name);
  const description = localizedString(product.description);
  const sku = product.masterVariant?.sku;

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
        <a href="/" className="hover:text-primary">Home</a>
        <span>/</span>
        <a href="/products" className="hover:text-primary">Products</a>
        <span>/</span>
        <span className="text-gray-900">{name}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Images */}
        <div>
          {images.length > 0 ? (
            <>
              <div className="aspect-square rounded-xl overflow-hidden bg-white border border-gray-100">
                <img
                  src={images[selectedImage]?.url}
                  alt={name}
                  className="w-full h-full object-contain"
                />
              </div>
              {images.length > 1 && (
                <div className="flex gap-2 mt-4">
                  {images.map((img: any, i: number) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(i)}
                      className={`w-16 h-16 rounded-lg overflow-hidden border-2 ${i === selectedImage ? 'border-primary' : 'border-gray-200'}`}
                    >
                      <img src={img.url} alt="" className="w-full h-full object-contain" />
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="aspect-square rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 text-4xl">
              No Image
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <h1 className="text-3xl font-bold mb-2">{name}</h1>
          {sku && <p className="text-sm text-gray-500 mb-4">SKU: {sku}</p>}
          {isLoggedIn ? (
            <>
              {price && (
                <p className="text-2xl font-bold text-primary mb-6">
                  {formatMoney(price.value)}
                </p>
              )}
              {!price && <p className="text-lg text-gray-500 mb-6">Price on request</p>}
            </>
          ) : (
            <p className="text-lg text-gray-500 mb-6">Sign in to see pricing</p>
          )}

          {description && (
            <div className="prose prose-sm text-gray-700 mb-6" dangerouslySetInnerHTML={{ __html: description }} />
          )}

          <div className="space-y-4 mb-8">
            {isLoggedIn ? (
              <AddToCartButton
                productId={product.id}
                variantId={product.masterVariant?.id ?? 1}
                availableQuantity={inventoryQuantity}
                isOutOfStock={isOutOfStock}
              />
            ) : (
              <Button variant="primary" href="/login">Sign In to Order</Button>
            )}
          </div>

          {/* Add to Purchase List */}
          {purchaseLists.length > 0 && (
            <div className="border-t border-gray-100 pt-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Add to Purchase List</h3>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Select
                    label=""
                    options={[
                      { value: '', label: 'Select a list...' },
                      ...purchaseLists.map((pl: any) => ({ value: pl.id, label: typeof pl.name === 'object' ? localizedString(pl.name) : pl.name })),
                    ]}
                    value={selectedList}
                    onChange={(e) => setSelectedList(e.target.value)}
                  />
                </div>
                <Button variant="secondary" onClick={handleAddToList} loading={addingToList} disabled={!selectedList}>
                  Add
                </Button>
              </div>
            </div>
          )}

          {/* Attributes */}
          {attributes.length > 0 && (
            <div className="border-t border-gray-100 pt-6 mt-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Product Details</h3>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                {attributes
                  .filter((attr: any) => {
                    // Hide reference-type attributes (arrays of product/category references)
                    const val = attr.value;
                    if (Array.isArray(val) && val.length > 0 && val[0]?.typeId) return false;
                    if (val && typeof val === 'object' && val.typeId) return false;
                    return true;
                  })
                  .map((attr: any) => (
                  <div key={attr.name}>
                    <dt className="text-gray-500 capitalize">{attr.name.replace(/([A-Z])/g, ' $1').trim()}</dt>
                    <dd className="font-medium">{formatAttributeValue(attr.value)}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
