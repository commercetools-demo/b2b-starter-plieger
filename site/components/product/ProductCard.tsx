'use client';

import Link from 'next/link';
import { formatMoney, localizedString } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import type { Product } from '@/lib/types';

export interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { isLoggedIn } = useAuth();
  const name = localizedString(product.name);
  const image = product.masterVariant.images?.[0];
  const price = product.masterVariant.price?.value
    ?? product.masterVariant.prices?.[0]?.value;
  const sku = product.masterVariant.sku;

  return (
    <Link
      href={`/products/${product.id}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-slate-200 bg-white transition-shadow hover:shadow-md"
    >
      {/* Image */}
      <div className="aspect-square overflow-hidden bg-slate-50">
        {image ? (
          <img
            src={image.url}
            alt={name}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-slate-400">
            No image
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-sm font-medium text-slate-900 group-hover:text-red-600">
          {name}
        </h3>
        {sku && (
          <p className="mt-0.5 text-xs text-slate-500">SKU: {sku}</p>
        )}
        <div className="mt-auto pt-3">
          {isLoggedIn ? (
            price ? (
              <p className="text-base font-semibold text-slate-900">
                {formatMoney(price)}
              </p>
            ) : (
              <p className="text-sm text-slate-500">Price on request</p>
            )
          ) : (
            <p className="text-sm text-slate-500">Sign in for pricing</p>
          )}
        </div>
      </div>
    </Link>
  );
}
