import { NextRequest, NextResponse } from 'next/server';
import { stegaClean } from '@sanity/client/stega';
import { getSiteSettings } from '@/lib/cms';
import { LLMS_FALLBACK } from '@/lib/llms-fallback';
import { categories } from '@/lib/data';

/** AI brain for the specialist chat. The scripted answers in SpecialistChat
 *  handle products/stores/guarantee/handoff; this route answers the free-form
 *  questions the script can't. Grounded in the same brand facts as /llms.txt,
 *  so editors "train" it by editing content, not models.
 *
 *  Requires ANTHROPIC_API_KEY in the hosting environment AND the "AI
 *  specialist chat" toggle ON in Site settings. Missing either → 503 and the
 *  chat silently stays scripted. Provider is swappable here server-side. */

export const maxDuration = 30;

type ChatMsg = { role: 'user' | 'assistant'; content: string };

const RULES = `You are the STROXX assistant on the STROXX brand website, chatting with professional tradespeople.

Rules:
- Answer in 1-4 short sentences. Plain, honest, no hype. British/Danish directness, a small twinkle is fine.
- Ground every claim in the brand facts below. NEVER invent prices, stock levels, discounts or product specifications. For anything price- or stock-specific, point to the Carl Ras webshop or a store.
- STROXX never sells directly; purchases happen at Carl Ras (stores or carl-ras.dk).
- Useful links you may mention as plain paths: /produkter (all products), /butikker (store finder), /proev-det (the guarantee campaign), /maanedens (tool of the month).
- If the question needs a human (complaints, orders, invoices, project advice, anything sensitive), say you'll hand over and tell them to type "yes" to be connected to a specialist.
- If asked something unrelated to STROXX, tools or the trade, politely steer back in one sentence.
- Reply in the language the customer writes in (English or Danish).`;

export async function POST(req: NextRequest) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return NextResponse.json({ fallback: true }, { status: 503 });

  const settings = await getSiteSettings();
  if (settings?.aiChatEnabled !== true) return NextResponse.json({ fallback: true }, { status: 503 });

  let messages: ChatMsg[] = [];
  try {
    const body = await req.json();
    messages = (Array.isArray(body?.messages) ? body.messages : [])
      .filter((m: ChatMsg) => (m?.role === 'user' || m?.role === 'assistant') && typeof m?.content === 'string')
      .slice(-10)
      .map((m: ChatMsg) => ({ role: m.role, content: m.content.slice(0, 2000) }));
  } catch {
    return NextResponse.json({ fallback: true }, { status: 400 });
  }
  if (!messages.length || messages[messages.length - 1].role !== 'user') {
    return NextResponse.json({ fallback: true }, { status: 400 });
  }

  const brandFacts = stegaClean(settings?.llmsTxt)?.trim() || LLMS_FALLBACK;
  const phone = stegaClean(settings?.supportPhone) || '+45 44 85 55 11';
  const catNames = categories.map((c) => c.name).join(', ');
  const system = `${RULES}

Customer service phone: ${phone}.
Product categories in the range: ${catNames}.

BRAND FACTS (source of truth):
${brandFacts}`;

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 350,
        system,
        messages,
      }),
      signal: AbortSignal.timeout(20000),
    });
    if (!r.ok) return NextResponse.json({ fallback: true }, { status: 503 });
    const data = await r.json();
    const reply = (data?.content ?? [])
      .filter((b: { type?: string }) => b?.type === 'text')
      .map((b: { text?: string }) => b.text ?? '')
      .join('')
      .trim();
    if (!reply) return NextResponse.json({ fallback: true }, { status: 503 });
    return NextResponse.json({ reply });
  } catch {
    return NextResponse.json({ fallback: true }, { status: 503 });
  }
}
