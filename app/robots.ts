import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

/** Allow everything; the hidden internal pages (/plan, /email-skabeloner)
 *  carry meta robots noindex instead of a Disallow here, because a Disallow
 *  line would both reveal the paths and stop crawlers from ever seeing the
 *  noindex. The API proxy is disallowed to save crawl budget. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/api/'] }],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
