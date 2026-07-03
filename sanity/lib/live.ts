import { defineLive } from 'next-sanity/live';
import { client } from './client';

/** Live-enabled fetch: published content for visitors, drafts + live updates
 *  inside the Presentation tool. The token has Viewer rights only; next-sanity
 *  exposes browserToken to the browser exclusively while draft mode is on. */
const token = process.env.SANITY_API_READ_TOKEN;

export const { sanityFetch, SanityLive } = defineLive({
  client,
  serverToken: token,
  browserToken: token,
});
