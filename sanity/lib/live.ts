import { defineLive } from 'next-sanity/live';
import { client } from './client';

/** Live-enabled fetch: published content for visitors, drafts + live updates
 *  inside the Presentation tool. The token has Viewer rights only; next-sanity
 *  exposes browserToken to the browser exclusively while draft mode is on. */
const token = process.env.SANITY_API_READ_TOKEN;

const live = defineLive({
  client,
  serverToken: token,
  browserToken: token,
});

export const SanityLive = live.SanityLive;

/** Every CMS read carries the stable 'sanity' cache tag ON TOP of next-sanity's
 *  per-query sync tags. Fetches are stored with revalidate:false (cached until
 *  a tag expires), and the sync tags are unknowable in advance, so this shared
 *  tag is what the Sanity publish webhook (/api/revalidate) expires to refresh
 *  the whole site in one call. Remove it and the webhook goes blind. */
export const sanityFetch = ((args: Parameters<typeof live.sanityFetch>[0]) =>
  live.sanityFetch({
    ...args,
    tags: ['sanity', ...(args.tags ?? [])],
    /* requestTag lands in the query URL, which is the data-cache KEY: bumping
       rv<N> orphans every previously cached entry at once. rv1 = the cutover
       to tagged caching (entries from before it carried no 'sanity' tag and
       would have been unreachable by the webhook forever). */
    requestTag: 'stroxx.rv1',
  } as Parameters<typeof live.sanityFetch>[0])) as typeof live.sanityFetch;
