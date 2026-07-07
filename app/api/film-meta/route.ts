import { NextRequest, NextResponse } from 'next/server';
import { rateLimit, clientIp } from '@/lib/rate-limit';
import { sameOrigin } from '@/lib/same-origin';

/** Film metadata lookup for the Studio FilmPicker. Given a YouTube id, returns
 *  the video's title and channel from YouTube's public oEmbed endpoint, so a
 *  pasted link becomes a properly-named film instead of an "untitled" one.
 *  Server-side (oEmbed sends no CORS headers, so the browser can't call it
 *  directly). Same-origin + rate-limited; returns blanks on any failure so the
 *  picker still works offline. */

export const maxDuration = 10;

export async function GET(req: NextRequest) {
  if (!sameOrigin(req)) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  if (!(await rateLimit(`film:${clientIp(req.headers)}`, 30, 60000))) {
    return NextResponse.json({ error: 'rate-limited' }, { status: 429 });
  }
  const id = req.nextUrl.searchParams.get('id') || '';
  if (!/^[\w-]{11}$/.test(id)) return NextResponse.json({ error: 'bad id' }, { status: 400 });

  try {
    const r = await fetch(
      `https://www.youtube.com/oembed?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${id}`)}&format=json`,
      { signal: AbortSignal.timeout(6000) }
    );
    if (!r.ok) return NextResponse.json({ title: '', author: '' });
    const j = (await r.json()) as { title?: string; author_name?: string };
    return NextResponse.json({ title: j.title ?? '', author: j.author_name ?? '' });
  } catch {
    return NextResponse.json({ title: '', author: '' });
  }
}
