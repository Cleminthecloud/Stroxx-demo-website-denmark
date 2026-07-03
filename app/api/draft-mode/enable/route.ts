import { defineEnableDraftMode } from 'next-sanity/draft-mode';
import { client } from '@/sanity/lib/client';

/** The Presentation tool calls this route to turn on Next.js draft mode inside
 *  its preview iframe. The token authenticates the preview-URL handshake. */
export const { GET } = defineEnableDraftMode({
  client: client.withConfig({ token: process.env.SANITY_API_READ_TOKEN }),
});
