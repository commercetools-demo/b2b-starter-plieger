import Link from 'next/link';
import { getCategories } from '@/lib/ct/products';
import { localizedString } from '@/lib/utils';

export default async function CategoriesPage() {
  const categories = await getCategories();
  const rootCategories = categories.filter((c: any) => !c.parent);

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <h1 className="text-3xl font-bold mb-8">Categorien</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {rootCategories.map((category: any) => (
          <Link
            key={category.id}
            href={`/c/${localizedString(category.slug)}`}
            className="group rounded-xl border border-slate-200 bg-white p-6 text-center hover:border-primary-light hover:shadow-md transition-all"
          >
            <h2 className="text-base font-semibold text-slate-900 group-hover:text-primary">
              {localizedString(category.name)}
            </h2>
            {category.description && (
              <p className="mt-1 text-xs text-slate-500 line-clamp-2">
                {localizedString(category.description)}
              </p>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
