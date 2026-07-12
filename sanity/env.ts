/** Sanity project coordinates. Public values only; the read token stays in
 *  process.env and never leaves the server (see sanity/lib/live.ts). */
export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'cr7dktly';
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'demo';
/* Bumping this date changes every query URL and therefore every Vercel Data
   Cache key: it is the code-side "purge everything" for CMS reads. Bumped
   2026-07-12 when stale cached fetches kept serving pre-neutralization
   content through multiple redeploys. */
export const apiVersion = '2026-07-12';
export const studioUrl = '/studio';
