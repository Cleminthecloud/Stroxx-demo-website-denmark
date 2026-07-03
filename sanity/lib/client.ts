import { createClient } from 'next-sanity';
import { projectId, dataset, apiVersion, studioUrl } from '../env';

/** Shared Sanity client. `stega.studioUrl` is what powers click-to-edit in the
 *  Presentation tool; stega encoding is only activated during draft mode by
 *  next-sanity, published fetches stay clean. */
export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
  stega: { studioUrl },
});
