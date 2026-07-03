/** Single source of truth for the public origin.
 *  Demo domain until production — swap HERE ONCE at launch and every
 *  canonical/OG/sitemap/robots/schema URL follows. (Email templates in
 *  public/emails/ are demo-only and intentionally not wired to this.) */
export const SITE_URL = 'https://stroxx-demo-website-denmark.vercel.app';

/** Development mode: true while we live on the demo vercel.app domain.
 *  Keeps the whole demo out of Google (robots + meta noindex). Flips off
 *  automatically the day SITE_URL becomes the real domain. */
export const IS_DEMO = SITE_URL.includes('vercel.app');
