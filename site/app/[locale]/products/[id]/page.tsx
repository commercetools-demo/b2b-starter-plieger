'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useLocale } from '@/context/LocaleContext';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import { Button } from '@/components/ui/Button';
import { AddToCartButton } from '@/components/product/AddToCartButton';
import { SubscribeAndSaveBox } from '@/components/product/SubscribeAndSaveBox';
import { Select } from '@/components/ui/Select';
import { RatingsSection } from '@/components/product/RatingsSection';
import { useRecurrencePolicies } from '@/hooks/useRecurrencePolicies';
import { useTranslations } from 'next-intl';
import { useFormatters } from '@/hooks/useFormatters';
import { localizedString } from '@/lib/utils';

function formatAttributeValue(value: any, formatMoney: (v: any) => string, locale?: string): string {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'number') return String(value);
  if (typeof value === 'string') return value;
  // Enum: { key, label } or localized enum: { key, label: { "en-US": "..." } }
  if (value.label !== undefined) {
    return typeof value.label === 'object' ? localizedString(value.label, locale) : String(value.label);
  }
  if (typeof value === 'object' && !Array.isArray(value) && value.centAmount === undefined) {
    return localizedString(value, locale);
  }
  // Money: { centAmount, currencyCode }
  if (value.centAmount !== undefined) {
    return formatMoney(value);
  }
  // Array of values
  if (Array.isArray(value)) {
    return value.map((v) => formatAttributeValue(v, formatMoney, locale)).join(', ');
  }
  return String(value);
}

export default function ProductDetailPage() {
  const t = useTranslations('product');
  const { formatMoney } = useFormatters();
  const { id } = useParams<{ id: string }>();
  const { locale, localePath } = useLocale();
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
  const { data: recurrencePolicies = [] } = useRecurrencePolicies();

  const [supplyChannelId, setSupplyChannelId] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/products/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setProduct(data.product ?? data);
        if (data.supplyChannelId) setSupplyChannelId(data.supplyChannelId);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

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
    const list = purchaseLists.find((l: any) => l.id === selectedList);
    if (!list) return;
    setAddingToList(true);
    try {
      await fetch(`/api/purchase-lists/${selectedList}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          version: list.version,
          productId: product.id,
          variantId: product.masterVariant?.id ?? 1,
          quantity: 1,
        }),
      });
      addToast('Toegevoegd aan projectlijst');
    } catch {
      addToast('Kan niet toevoegen aan projectlijst');
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
        <h1 className="text-2xl font-bold mb-2">{t('notFound')}</h1>
        <p className="text-gray-600 mb-6">{t('notFoundDescription')}</p>
        <Button variant="primary" href={localePath('/products')}>{t('backToProducts')}</Button>
      </div>
    );
  }

  const images = product.masterVariant?.images ?? [];
  // Prefer embedded price (from priceChannel selection), fall back to prices array
  const price = product.masterVariant?.price ?? product.masterVariant?.prices?.[0];
  const attributes = product.masterVariant?.attributes ?? [];
  const recurringPrices = product.masterVariant?.recurrencePrices?.filter((p: any) => p.recurrencePolicy);
  const allPrices = product.masterVariant?.prices.concat(recurringPrices);
  const showSubscribeAndSave = isLoggedIn && recurringPrices?.length > 0 && recurrencePolicies?.length > 0;
  const name = localizedString(product.name, locale);
  const description = localizedString(product.description, locale);
  const sku = product.masterVariant?.sku;

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
        <a href={localePath('/')} className="hover:text-primary">Home</a>
        <span>/</span>
        <a href={localePath('/products')} className="hover:text-primary">Producten</a>
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
              {t('noImage')}
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
              {!price && <p className="text-lg text-gray-500 mb-6">{t('priceOnRequest')}</p>}
            </>
          ) : (
            <p className="text-lg text-gray-500 mb-6">{t('signInToSeePricing')}</p>
          )}

          {description && (
            <div className="prose prose-sm text-gray-700 mb-6" dangerouslySetInnerHTML={{ __html: description }} />
          )}

          <div className="space-y-4 mb-8">
            {isLoggedIn ? (
              showSubscribeAndSave ? (
                <SubscribeAndSaveBox
                  productId={product.id}
                  variantId={product.masterVariant?.id ?? 1}
                  prices={allPrices}
                  policies={recurrencePolicies}
                  availableQuantity={inventoryQuantity}
                  isOutOfStock={isOutOfStock}
                />
              ) : (
                <AddToCartButton
                  productId={product.id}
                  variantId={product.masterVariant?.id ?? 1}
                  availableQuantity={inventoryQuantity}
                  isOutOfStock={isOutOfStock}
                />
              )
            ) : (
              <Button variant="primary" href={localePath('/login')}>Sign In to Order</Button>
            )}
          </div>

          {/* Add to Purchase List */}
          {purchaseLists.length > 0 && (
            <div className="border-t border-gray-100 pt-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Voeg toe aan projectlijst</h3>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Select
                    label=""
                    options={[
                      { value: '', label: 'Selecteer een lijst...' },
                      ...purchaseLists.map((pl: any) => ({ value: pl.id, label: typeof pl.name === 'object' ? localizedString(pl.name) : pl.name })),
                    ]}
                    value={selectedList}
                    onChange={(e) => setSelectedList(e.target.value)}
                  />
                </div>
                <Button variant="secondary" onClick={handleAddToList} loading={addingToList} disabled={!selectedList}>
                  Toevoegen
                </Button>
              </div>
            </div>
          )}

          {/* Attributes */}
          {attributes.length > 0 && (
            <div className="border-t border-gray-100 pt-6 mt-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Details</h3>
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
                    <dd className="font-medium">{formatAttributeValue(attr.value, formatMoney, locale)}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>
      </div>

      {/* Ratings & Reviews */}
      <RatingsSection productId={product.id} />
    </div>
  );
}
