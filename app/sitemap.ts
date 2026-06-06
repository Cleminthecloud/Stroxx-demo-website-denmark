import type { MetadataRoute } from 'next';
import { products } from '@/lib/data';
import { trades } from '@/lib/trades';

const BASE = 'https://stroxx-demo-website-denmark.vercel.app';

/** Public pages only: hidden internals (/plan, /email-skabeloner) and the
 *  /kategori redirects are deliberately left out. */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${BASE}/`, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE}/produkter`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE}/butikker`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/proev-det`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/service`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/fag`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    ...trades.map((t) => ({
      url: `${BASE}/fag/${t.slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
    ...products.map((p) => ({
      url: `${BASE}/produkt/${p.slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
  ];
}
