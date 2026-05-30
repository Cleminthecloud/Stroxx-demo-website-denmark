import { Suspense } from 'react';
import ProductExplorer from '@/components/ProductExplorer';

export const metadata = { title: 'Produkter — STROXX' };

export default function ProdukterPage() {
  return (
    <main className="min-h-screen bg-ink">
      <Suspense fallback={<div className="pt-40 text-center text-fog">Laster…</div>}>
        <ProductExplorer />
      </Suspense>
    </main>
  );
}
