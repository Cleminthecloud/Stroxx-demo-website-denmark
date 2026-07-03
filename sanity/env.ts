/** Sanity project coordinates. Public values only; the read token stays in
 *  process.env and never leaves the server (see sanity/lib/live.ts). */
export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'cr7dktly';
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'demo';
export const apiVersion = '2026-07-01';
export const studioUrl = '/studio';
