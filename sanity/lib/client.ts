import { createClient } from 'next-sanity';
import { projectId, dataset, apiVersion, studioUrl } from '../env';

/** Shared Sanity client. `stega.studioUrl` is what powers click-to-edit in the
 *  Presentation tool; stega encoding is only activated during draft mode by
 *  next-sanity, published fetches stay clean.
 *
 *  THE TOKEN IS WHAT LETS THE DATASET BE PRIVATE, and it has to live here
 *  rather than only on `defineLive`. next-sanity attaches its `serverToken` to
 *  a fetch ONLY when the perspective is drafts or stega is on
 *  (`next-sanity/dist/live/conditions/react-server/index.js`: `const token =
 *  (perspective && perspective !== "published" || stega) && serverToken ? ...`).
 *  An ordinary visitor is neither, so published reads would go out
 *  unauthenticated and every page would 401 the moment the dataset stops being
 *  world-readable. @sanity/client resolves a request's token as
 *  `overrides.token || config.token`, so the undefined it passes per fetch
 *  falls back to this one.
 *
 *  Safe in the browser bundle for two independent reasons, and it needs to stay
 *  that way: `SANITY_API_READ_TOKEN` has no NEXT_PUBLIC_ prefix, so Next never
 *  inlines it into client code (it compiles to undefined there), and
 *  `defineLive`'s SanityLive component copies only projectId, dataset,
 *  apiHost, apiVersion and requestTagPrefix out of this config, handing the
 *  browser its own `browserToken` instead. Locked by tests/sanity-client.test.ts:
 *  do not import this module from a 'use client' file.
 *
 *  Viewer rights only. It reads; it can write nothing. */
export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
  token: process.env.SANITY_API_READ_TOKEN,
  stega: { studioUrl },
});
