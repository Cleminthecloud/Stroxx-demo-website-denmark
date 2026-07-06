import { NextRequest, NextResponse } from 'next/server';
import { rateLimit, clientIp } from '@/lib/rate-limit';
import { sameOrigin } from '@/lib/same-origin';
import { stegaClean } from '@sanity/client/stega';
import { getSiteSettings } from '@/lib/cms';
import { categories } from '@/lib/data';
import { LLMS_FALLBACK } from '@/lib/llms-fallback';

/** The article AI behind the Studio's "Article AI" tab. Four modes:
 *    ideas   trending topic recommendations per market (live web search)
 *    draft   a full article draft from a chosen idea/brief
 *    polish  improve an editor's own draft, keeping their voice
 *    social  LinkedIn post + hashtags for a finished article
 *  Grounded in the same brand facts as /llms.txt, so recommendations stay
 *  on-brand. Uses the ANTHROPIC_API_KEY already in the hosting env; the
 *  ideas mode adds Anthropic's server-side web search (capped) so "trending"
 *  means today, not training data. Rate-limited: this endpoint costs money. */

export const maxDuration = 60;

const MARKETS: Record<string, string> = {
  dk: 'Denmark (retailer: Carl Ras, language on LinkedIn: Danish)',
  de: 'Germany (retailer: Meesenburg, language on LinkedIn: German)',
  fr: 'France (retailer: Foussier, language on LinkedIn: French)',
  be: 'Belgium (retailer: Lecot, languages: Dutch and French)',
  all: 'all four markets combined (Denmark, Germany, France, Belgium) — find themes that travel across borders and note per-market angles',
};

const MODES = ['ideas', 'draft', 'polish', 'social'] as const;
type Mode = (typeof MODES)[number];

function systemFor(mode: Mode, market: string, brandFacts: string, catNames: string) {
  const base = `You are the article assistant for STROXX, a professional tool brand for tradespeople (carpenters, electricians, plumbers, masons, painters). You help the brand team run the news/blog section on the STROXX website and turn articles into LinkedIn reach.

Market focus: ${MARKETS[market] || MARKETS.dk}.
Product categories: ${catNames}.

BRAND FACTS (source of truth, never contradict):
${brandFacts}

House rules:
- Audience is professional tradespeople and the buyers around them, never hobbyists.
- Plain, honest, concrete. No hype words, no exclamation marks, no em dashes.
- NEVER invent prices, specs, test results or statistics. If a claim needs a number you do not have, say where the editor should get it.
- Articles that answer real questions get quoted by AI assistants (ChatGPT, Perplexity, Google AI). Prefer question-shaped headlines and give the direct answer in the first two sentences: that is how the brand gets into AI answers.
- STROXX content handles (from the brand strategy, use them to frame ideas and suggest them as tags): "Quality proof" = premium credibility stories that shift perception from cheap to professional quality; "Professional favorites" = what pros actually buy and rebuy; "New solutions" = new products and smarter methods. Plus evergreen know-how tagged Tips/Regulations/Safety and the trades. Quality and value are the story, never price.`;

  if (mode === 'ideas')
    return `${base}

Task: recommend article topics the team should write THIS WEEK. Use web search to check what is actually being discussed right now in the construction/trades world for this market (regulations, seasons, material prices, tool trends, industry news). Return exactly 6 ideas, formatted:

## 1. [Question-shaped headline]
**Why now:** what makes this timely (cite what you found)
**Angle:** the STROXX take in one sentence
**People search for:** 2-3 real phrases
**LinkedIn hook:** first line of the post that would make a tradesperson stop scrolling
**Hashtags:** 3-4 (note: hashtags carry little weight on LinkedIn these days; the hook matters more)

Mix across the three handles (Quality proof, Professional favorites, New solutions) plus seasonal/evergreen know-how. For each idea, name the handle it serves. End with one line naming which single idea you would write first and why.`;

  if (mode === 'draft')
    return `${base}

Task: write a complete article draft from the editor's brief. Format:

## Suggested headline
(question-shaped if natural)

## Article
500-800 words. Direct answer in the first two sentences. Short paragraphs. Subheadings as plain short lines. No bullet-point spam; write like a knowledgeable colleague. Weave in at most 2 natural references to STROXX or the retailer, never a sales pitch.

## Excerpt
One or two sentences for the index card and search results.

## SEO title + description
Title under 60 characters; description under 155.

## Share image idea
One sentence describing the photo that would make the LinkedIn card get clicked (this becomes the article's share image; remind them the OG image does half the work on LinkedIn).

## LinkedIn post
3-5 short lines in the market's language, hook first, one question to invite comments, link goes in the post. 3 hashtags max.`;

  if (mode === 'polish')
    return `${base}

Task: improve the editor's draft. Keep THEIR voice and structure; fix flow, cut filler, sharpen the opening so the direct answer lands in the first two sentences, tighten the headline. Return:

## Polished draft
(the improved text)

## What I changed
3-5 short lines so they learn for next time.`;

  return `${base}

Task: the editor gives you a finished article (title, excerpt or text, and its URL). Write the LinkedIn post that earns the click. Return:

## LinkedIn post
3-5 short lines in the market's language. Hook first line, no "New blog post!" openers. One question at the end to invite comments. Then the link on its own line. 3 hashtags max (they matter less than the hook these days).

## Second variant
A different angle on the same article, for reposting a week later.

## Reminder
One line: the share image and OG title decide how the link looks on LinkedIn; check them before posting.`;
}

export async function POST(req: NextRequest) {
  /* costs real money: same-origin only + tighter limit than the chat */
  if (!sameOrigin(req)) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  if (!(await rateLimit(`agent:${clientIp(req.headers)}`, 6, 60000))) {
    return NextResponse.json({ error: 'rate-limited' }, { status: 429 });
  }
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return NextResponse.json({ error: 'not-configured' }, { status: 503 });

  let mode: Mode = 'ideas';
  let market = 'dk';
  let input = '';
  try {
    const body = await req.json();
    mode = MODES.includes(body?.mode) ? body.mode : 'ideas';
    market = typeof body?.market === 'string' && MARKETS[body.market] ? body.market : 'dk';
    input = String(body?.input ?? '').slice(0, 12000);
  } catch {
    return NextResponse.json({ error: 'bad-request' }, { status: 400 });
  }
  if (mode !== 'ideas' && !input.trim()) {
    return NextResponse.json({ error: 'missing-input' }, { status: 400 });
  }

  const settings = await getSiteSettings();
  const brandFacts = stegaClean(settings?.llmsTxt)?.trim() || LLMS_FALLBACK;
  const catNames = categories.map((c) => c.name).join(', ');
  const system = systemFor(mode, market, brandFacts, catNames);
  const user =
    mode === 'ideas'
      ? `Today is ${new Date().toISOString().slice(0, 10)}. ${input.trim() || 'Give me this week’s article recommendations.'}`
      : input;

  const call = async (withSearch: boolean) =>
    fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 2500,
        system,
        messages: [{ role: 'user', content: user }],
        ...(withSearch ? { tools: [{ type: 'web_search_20250305', name: 'web_search', max_uses: 4 }] } : {}),
      }),
      signal: AbortSignal.timeout(50000),
    });

  try {
    /* ideas mode tries live web search first; if the account/tool rejects it,
       fall back to a plain call (seasonal + evergreen still works well) */
    let r = await call(mode === 'ideas');
    if (!r.ok && mode === 'ideas') r = await call(false);
    if (!r.ok) return NextResponse.json({ error: 'upstream' }, { status: 502 });
    const data = await r.json();
    const text = (data?.content ?? [])
      .filter((b: { type?: string }) => b?.type === 'text')
      .map((b: { text?: string }) => b.text ?? '')
      .join('')
      .trim();
    if (!text) return NextResponse.json({ error: 'empty' }, { status: 502 });
    return NextResponse.json({ text });
  } catch {
    return NextResponse.json({ error: 'upstream' }, { status: 502 });
  }
}
