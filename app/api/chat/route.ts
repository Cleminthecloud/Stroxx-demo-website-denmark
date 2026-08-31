import { NextRequest, NextResponse } from 'next/server';
import { rateLimit, clientIp } from '@/lib/rate-limit';
import { sameOrigin } from '@/lib/same-origin';
import { stegaClean } from '@sanity/client/stega';
import { getSiteSettings, getMarkets } from '@/lib/cms';
import { marketByCode } from '@/lib/markets';
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
- Ground every claim in the brand facts below. NEVER invent prices, stock levels, discounts or product specifications. For anything price- or stock-specific, point to the dealer's webshop or a store.
- STROXX never sells directly; purchases happen at the market's dealer (see the dealer line below, or the store finder at /stores).
- Useful links you may mention as plain paths (the interface renders them as clickable links): /products (all products), /stores (store finder; each store lists its STROXX specialist), /try-it (the guarantee campaign), /satisfaction-guarantee (the guarantee's full terms), /monthly (tool of the month), /news (news and articles).
- If the question needs a human (complaints, orders, invoices, project advice, anything sensitive), say you'll hand over and tell them to type "yes" to be connected to a specialist.
- If asked something unrelated to STROXX, tools or the trade, politely steer back in one sentence.
- Reply in the language the customer writes in (Danish, English, German, French, Dutch, any language).`;

export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return NextResponse.json({ fallback: true }, { status: 403 });
  // cost protection: 10 messages/minute per IP is generous for humans
  if (!(await rateLimit(`chat:${clientIp(req.headers)}`, 10, 60000))) {
    return NextResponse.json({ fallback: true }, { status: 429 });
  }
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return NextResponse.json({ fallback: true }, { status: 503 });

  const settings = await getSiteSettings();
  if (settings?.aiChatEnabled !== true) return NextResponse.json({ fallback: true }, { status: 503 });

  let messages: ChatMsg[] = [];
  let marketCode = '';
  try {
    const body = await req.json();
    messages = (Array.isArray(body?.messages) ? body.messages : [])
      .filter((m: ChatMsg) => (m?.role === 'user' || m?.role === 'assistant') && typeof m?.content === 'string')
      .slice(-10)
      .map((m: ChatMsg) => ({ role: m.role, content: m.content.slice(0, 2000) }));
    /* The client sends its market code (the proxy skips /api, so headers can't
       tell us). Only used to pick which PUBLIC dealer phone/name to quote, and
       validated against the market registry below — safe as client input. */
    if (typeof body?.market === 'string' && /^[a-z]{2,3}$/.test(body.market)) marketCode = body.market;
  } catch {
    return NextResponse.json({ fallback: true }, { status: 400 });
  }
  if (!messages.length || messages[messages.length - 1].role !== 'user') {
    return NextResponse.json({ fallback: true }, { status: 400 });
  }

  const brandFacts = stegaClean(settings?.llmsTxt)?.trim() || LLMS_FALLBACK;
  /* Dealer identity from the MARKET registry (never hardcoded): the validated
     client market code picks the dealer; unknown/international → no single
     dealer, the assistant points to the store finder instead. */
  const dealer = marketCode ? marketByCode(marketCode, await getMarkets()) : undefined;
  const dealerLine = dealer?.dealerName
    ? `Dealer for this market: ${dealer.dealerName}.${dealer.supportPhone ? ` Customer service phone: ${dealer.supportPhone}.` : ''}`
    : 'This is the international site: there is no single dealer. Point buying or service questions to the store finder at /stores or the "Where to buy" chooser.';
  const catNames = categories.map((c) => c.name).join(', ');
  const system = `${RULES}

${dealerLine}
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
