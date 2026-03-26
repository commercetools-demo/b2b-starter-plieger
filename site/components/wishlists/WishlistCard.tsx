'use client';

import Link from 'next/link';
import { useFormatters } from '@/hooks/useFormatters';
import { useLocale } from '@/context/LocaleContext';

interface WishlistCardProps {
  wishlist: {
    id: string;
    name: Record<string, string> | string;
    lineItems: any[];
    createdAt: string;
  };
  onDelete: (id: string) => void;
}

export function WishlistCard({ wishlist, onDelete }: WishlistCardProps) {
  const { localizedString, formatDate } = useFormatters();
  const { localePath } = useLocale();
  const name = typeof wishlist.name === 'object' ? localizedString(wishlist.name) : wishlist.name;
  const count = wishlist.lineItems?.length ?? 0;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 flex items-start justify-between">
      <div>
        <Link
          href={localePath(`/wishlists/${wishlist.id}`)}
          className="text-base font-semibold text-slate-900 hover:text-red-600"
        >
          {name}
        </Link>
        <p className="text-sm text-slate-500 mt-0.5">
          {count} {count === 1 ? 'item' : 'items'}
        </p>
        <p className="text-xs text-slate-400 mt-1">
          Created {formatDate(wishlist.createdAt)}
        </p>
      </div>
      <div className="flex gap-2">
        <Link
          href={localePath(`/wishlists/${wishlist.id}`)}
          className="text-sm text-slate-600 hover:text-red-600 px-3 py-1.5 rounded-md border border-slate-200 hover:border-red-300 transition-colors"
        >
          View
        </Link>
        <button
          onClick={() => onDelete(wishlist.id)}
          className="text-sm text-slate-600 hover:text-red-600 px-3 py-1.5 rounded-md border border-slate-200 hover:border-red-300 transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
