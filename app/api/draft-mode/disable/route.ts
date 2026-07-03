import { draftMode } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

/** Exit preview: turns draft mode off and returns to where the editor was. */
export async function GET(req: NextRequest) {
  (await draftMode()).disable();
  const back = req.nextUrl.searchParams.get('back') || '/';
  return NextResponse.redirect(new URL(back.startsWith('/') ? back : '/', req.url));
}
