import { draftMode } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

/** Exit preview: turns draft mode off and returns to where the editor was. */
export async function GET(req: NextRequest) {
  (await draftMode()).disable();
  const back = req.nextUrl.searchParams.get('back') || '/';
  /* Same-site paths only: a single leading '/' NOT followed by '/' or '\'.
     '//evil.com' and '/\evil.com' resolve to an external origin in the URL
     constructor, so a bare startsWith('/') check would be an open redirect. */
  const safe = /^\/(?![/\\])/.test(back) ? back : '/';
  return NextResponse.redirect(new URL(safe, req.url));
}
