import type { MetadataRoute } from 'next';
import { products } from '@/lib/data';
import { getLandingSlugs, getPosts, getSupportPages, getTrades } from '@/lib/cms';
import { SITE_URL as BASE } from '@/lib/site';

/** Public pages only: hidden internals (/komponenter, /guide) and the
 *  /kategori redirects are deliberately left out.
 *  CMS landing pages are included automatically. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const landingSlugs = await getLandingSlugs();
  const posts = await getPosts();
  const supportPages = await getSupportPages();
  const trades = await getTrades();
  return [
    { url: `${BASE}/`, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE}/produkter`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE}/maanedens`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE}/butikker`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/proev-det`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/service`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/fag`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    ...landingSlugs.map((s) => ({
      url: `${BASE}/kampagne/${s}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
    /* news index only when articles exist; articles ride along automatically */
    ...(posts.length ? [{ url: `${BASE}/nyheder`, lastModified: now, changeFrequency: 'weekly' as const, priority: 0.7 }] : []),
    ...posts.map((p) => ({
      url: `${BASE}/nyheder/${p.slug?.current}`,
      lastModified: p.publishedAt ? new Date(p.publishedAt) : now,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
    /* support & downloads: the packaging QR targets, they rank on Google */
    ...(supportPages.length
      ? [{ url: `${BASE}/support`, lastModified: now, changeFrequency: 'monthly' as const, priority: 0.7 }]
      : []),
    ...supportPages.map((p) => ({
      url: `${BASE}/support/${p.slug?.current}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
    ...['privatliv', 'cookies', 'handelsbetingelser'].map((s) => ({
      url: `${BASE}/${s}`,
      lastModified: now,
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    })),
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
