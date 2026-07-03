import { stegaClean } from '@sanity/client/stega';
import { getSiteSettings } from '@/lib/cms';
import { LLMS_FALLBACK } from '@/lib/llms-fallback';

/** /llms.txt for AI answer engines. Editable in Site settings ("AEO: llms.txt
 *  content"); the built-in text serves when the field is empty. */
export const revalidate = 300;

export async function GET() {
  const s = await getSiteSettings();
  const txt = stegaClean(s?.llmsTxt)?.trim() || LLMS_FALLBACK;
  return new Response(txt, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
