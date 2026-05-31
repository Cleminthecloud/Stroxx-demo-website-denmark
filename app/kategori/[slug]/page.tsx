import { redirect } from 'next/navigation';

/** Category pages are now folded into the unified product finder — a single
 *  place to filter categories and search/sort every product. Old category
 *  links land in the finder, pre-filtered to that category. */
export default function CategoryRedirect({ params }: { params: { slug: string } }) {
  redirect(`/produkter?cat=${params.slug}`);
}
