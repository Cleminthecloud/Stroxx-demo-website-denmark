import { NextRequest, NextResponse } from 'next/server';
import { rateLimit, clientIp } from '@/lib/rate-limit';
import { sameOrigin } from '@/lib/same-origin';
import { HELP_KNOWLEDGE } from '@/lib/help-knowledge';

/** The STROXX Studio help assistant. Answers editor how-to questions grounded
 *  ONLY in lib/help-knowledge.ts, so it can't invent platform behaviour. Uses
 *  the ANTHROPIC_API_KEY already in the hosting env (same as the specialist
 *  chat). Same-origin + rate-limited; degrades gracefully with no key. */

export const maxDuration = 30;

type Msg = { role: 'user' | 'assistant'; content: string };

const SYSTEM = `You are the help assistant inside the STROXX content Studio (a Sanity CMS). You help the marketing/content team do things in the CMS.

Rules:
- Answer ONLY from the KNOWLEDGE below. If it is not covered, say so plainly and suggest the Guide tab or asking the developer. Never invent behaviour, field names, or menus.
- Be short and practical. Name the exact place to click (which document, which tab/group). One or two short paragraphs, or a tight numbered list for steps.
- Warm, plain, confident. No hype, no exclamation marks. No em or en dashes (use commas or "to").
- Never discuss or invent prices: the brand site has none.
- If the user seems stuck or it is a bigger change, point them to the Guide (Studio → Guide) or /components.

KNOWLEDGE:
${HELP_KNOWLEDGE}`;

export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  if (!(await rateLimit(`help:${clientIp(req.headers)}`, 20, 60000))) {
    return NextResponse.json({ error: 'rate-limited' }, { status: 429 });
  }

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    return NextResponse.json(
      { reply: 'The help assistant is not switched on yet (its AI key is missing in the hosting environment). Meanwhile, the Guide tab has the how-tos.' },
      { status: 200 }
    );
  }

  let messages: Msg[] = [];
  try {
    const body = await req.json();
    messages = (Array.isArray(body?.messages) ? body.messages : [])
      .filter((m: unknown): m is Msg => {
        const x = m as Msg;
        return x && (x.role === 'user' || x.role === 'assistant') && typeof x.content === 'string';
      })
      .map((m: Msg) => ({ role: m.role, content: m.content.slice(0, 4000) }))
      .slice(-10);
  } catch {
    return NextResponse.json({ error: 'bad-request' }, { status: 400 });
  }
  if (!messages.length || messages[messages.length - 1].role !== 'user') {
    return NextResponse.json({ error: 'missing-question' }, { status: 400 });
  }

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 700,
        system: SYSTEM,
        messages,
      }),
      signal: AbortSignal.timeout(25000),
    });
    if (!r.ok) return NextResponse.json({ error: 'upstream' }, { status: 502 });
    const data = (await r.json()) as { content?: { type: string; text?: string }[] };
    const reply = (data.content ?? []).filter((b) => b.type === 'text').map((b) => b.text ?? '').join('').trim();
    return NextResponse.json({ reply: reply || 'I could not find that in the guide. Try the Guide tab, or ask the developer.' });
  } catch {
    return NextResponse.json({ error: 'upstream' }, { status: 502 });
  }
}
