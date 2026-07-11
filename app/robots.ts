import type { MetadataRoute } from 'next';
import { SITE_URL, IS_DEMO } from '@/lib/site';

/** While IS_DEMO (vercel.app domain) the whole site is blocked from crawlers,
 *  so the placeholder demo never lands in Google. On the real domain: allow
 *  everything; the hidden internal pages (/components, /guide) carry meta
 *  robots noindex instead of a Disallow here, because a Disallow line would
 *  both reveal the paths and stop crawlers from ever seeing the noindex.
 *  The API proxy is disallowed to save crawl budget. */
export default function robots(): MetadataRoute.Robots {
  if (IS_DEMO) {
    return { rules: [{ userAgent: '*', disallow: '/' }] };
  }
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/api/'] }],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
