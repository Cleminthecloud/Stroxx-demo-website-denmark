import { Suspense } from 'react';
import ProductExplorer from '@/components/ProductExplorer';

// NOTE: layout.tsx has a title TEMPLATE that appends " | STROXX"; child pages
// must NOT append it themselves or tabs read "Products | STROXX | STROXX".
export const metadata = {
  title: 'Products',
  description:
    'Find your STROXX tool: filter 358 products by category, name or item number, and jump straight to the buy at Carl Ras. Pro quality without the brand markup.',
};

export default function ProdukterPage() {
  return (
    <main className="min-h-screen bg-ink">
      <Suspense fallback={<div className="pt-40 text-center text-fog">Loading…</div>}>
        <ProductExplorer />
      </Suspense>
    </main>
  );
}
