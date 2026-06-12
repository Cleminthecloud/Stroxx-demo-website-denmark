import { Suspense } from 'react';
import ProductExplorer from '@/components/ProductExplorer';

// NOTE: layout.tsx has a title TEMPLATE that appends " — STROXX"; child pages
// must NOT append it themselves or tabs read "Produkter — STROXX — STROXX".
export const metadata = {
  title: 'Produkter',
  description:
    'Find dit STROXX-værktøj: filtrér 358 produkter på kategori, navn eller varenummer, og spring direkte til købet hos Carl Ras. Pro-kvalitet uden mærke-tillæg.',
};

export default function ProdukterPage() {
  return (
    <main className="min-h-screen bg-ink">
      <Suspense fallback={<div className="pt-40 text-center text-fog">Indlæser…</div>}>
        <ProductExplorer />
      </Suspense>
    </main>
  );
}
