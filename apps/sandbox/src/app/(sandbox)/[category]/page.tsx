import {categories} from '../../sandboxPages';
import {CategoryContent} from './CategoryContent';

// Required for static export — pre-generate all category pages
export function generateStaticParams() {
  return categories
    .filter(c => c.slug !== 'templates')
    .map(c => ({category: c.slug}));
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{category: string}>;
}) {
  const {category: slug} = await params;
  return <CategoryContent slug={slug} />;
}
