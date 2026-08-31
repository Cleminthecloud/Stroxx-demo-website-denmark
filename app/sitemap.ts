import type { MetadataRoute } from 'next';
import { products } from '@/lib/data';
import { getLandingSlugs, getPosts, getSupportPages, getTrades, getSiteSettings, getLineupArchive, getSka } from '@/lib/cms';
import { SITE_URL as BASE } from '@/lib/site';

/** Public pages only: hidden internals (/components, /guide) and the
 *  /category redirects are deliberately left out.
 *  CMS landing pages are included automatically. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const landingSlugs = await getLandingSlugs();
  /* news drops out entirely when the market has the section switched off */
  const newsOn = (await getSiteSettings())?.newsEnabled !== false;
  const posts = newsOn ? await getPosts() : [];
  const supportPages = await getSupportPages();
  const trades = await getTrades();
  /* the monthly archive: the index plus one permanent URL per published month.
     The live month is left out, /monthly is its canonical address (the dated
     route redirects there), so the two never compete in search. */
  const [archive, currentMonth] = await Promise.all([getLineupArchive(), getSka()]);
  const archivedMonths = archive.filter((m) => m.period !== currentMonth.period);
  return [
    { url: `${BASE}/`, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE}/products`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE}/monthly`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    ...(archivedMonths.length
      ? [{ url: `${BASE}/monthly/archive`, lastModified: now, changeFrequency: 'monthly' as const, priority: 0.6 }]
      : []),
    ...archivedMonths.map((m) => ({
      url: `${BASE}/monthly/${m.period}`,
      lastModified: m.activeFrom ? new Date(m.activeFrom) : now,
      changeFrequency: 'yearly' as const,
      priority: 0.5,
    })),
    { url: `${BASE}/stores`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    /* /try-it permanently redirects to its CMS landing page — list the
       canonical target, never the redirect (getLandingSlugs excludes proev-det,
       so it is added here explicitly) */
    { url: `${BASE}/campaign/try-it`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/service`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/satisfaction-guarantee`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/trades`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    ...landingSlugs.map((s) => ({
      url: `${BASE}/campaign/${s}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
    /* news index only when articles exist; articles ride along automatically */
    ...(posts.length ? [{ url: `${BASE}/news`, lastModified: now, changeFrequency: 'weekly' as const, priority: 0.7 }] : []),
    ...posts.map((p) => ({
      url: `${BASE}/news/${p.slug?.current}`,
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
    ...['privacy', 'cookies', 'terms'].map((s) => ({
      url: `${BASE}/${s}`,
      lastModified: now,
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    })),
    ...trades.map((t) => ({
      url: `${BASE}/trades/${t.slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
    ...products.map((p) => ({
      url: `${BASE}/product/${p.slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
  ];
}
