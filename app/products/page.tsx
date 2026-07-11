import { Suspense } from 'react';
import ProductExplorer from '@/components/ProductExplorer';
import { getSiteSettings } from '@/lib/cms';

// NOTE: layout.tsx has a title TEMPLATE that appends " | STROXX"; child pages
// must NOT append it themselves or tabs read "Products | STROXX | STROXX".
export const metadata = {
  title: 'Products',
  description:
    'Find your STROXX tool: filter 358 products by category, name or item number, and jump straight to the buy at Carl Ras. Pro quality without the brand markup.',
};

export default async function ProdukterPage() {
  const s = await getSiteSettings();
  return (
    <main className="min-h-screen bg-ink">
      <Suspense fallback={<div className="pt-40 text-center text-fog">Loading…</div>}>
        <ProductExplorer headline={s?.produkterHeadline} intro={s?.produkterIntro} />
      </Suspense>
    </main>
  );
}
