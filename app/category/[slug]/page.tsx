import { redirect } from 'next/navigation';
import { CATEGORY_SLUG_DA_EN } from '@/lib/redirects';

/** Category pages are now folded into the unified product finder — a single
 *  place to filter categories and search/sort every product. Old category
 *  links land in the finder, pre-filtered to that category. Old Danish
 *  category slugs (pre English-slug sweep, 2026-07-11) translate on the way. */
export default async function CategoryRedirect({ params }: { params: Promise<{ slug: string }> }) {
  const slug = (await params).slug;
  redirect(`/products?cat=${CATEGORY_SLUG_DA_EN[slug] ?? slug}`);
}
