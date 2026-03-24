import { notFound } from 'next/navigation';
import { getCategoryBySlug } from '@/lib/ct/products';
import { localizedString } from '@/lib/utils';
import { CategoryView } from '@/components/search/CategoryView';

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  return (
    <CategoryView
      categoryId={category.id}
      categoryName={localizedString(category.name)}
    />
  );
}
