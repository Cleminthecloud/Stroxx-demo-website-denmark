'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Send, Phone, ArrowUpRight } from 'lucide-react';
import { products, toolTexture, Product } from '@/lib/data';
import KnockoutImage from '@/components/KnockoutImage';
import { Store } from '@/lib/stores';

/** The specialist chat: scripted answers from the site's real data (guarantee
 *  terms, store list, live product catalogue) with free-form questions handled
 *  by the AI (/api/chat) when enabled. The human handoff composes a brief from
 *  the conversation and passes it to the nearest store manager via call or
 *  prefilled WhatsApp. */

interface BtnLink { label: string; href: string; external?: boolean }
interface Msg { from: 'bot' | 'user'; text: string; links?: BtnLink[]; products?: Product[]; handoff?: boolean; kind?: 'fallback' }

const DEFAULT_CHIPS = ['How does the guarantee work?', 'Find my store', 'Got a good knife?', 'Talk to a human'];

const norm = (s: string) =>
  s.toLowerCase().replace(/ø/g, 'o').replace(/å/g, 'a').replace(/æ/g, 'ae');

/** Friendly labels for site paths the AI mentions, so replies show styled
 *  clickable links instead of raw paths. Unknown paths keep their path text
 *  but still become links. Next's Link prefetches routes as they appear, so
 *  the recommended page is warm before the tap. */
const PATH_LABELS: [RegExp, string][] = [
  [/^\/produkter/, 'Products'],
  [/^\/butikker/, 'Store finder'],
  [/^\/proev-det/, 'The 30-day guarantee'],
  [/^\/maanedens/, 'Tool of the Month'],
  [/^\/nyheder/, 'News'],
  [/^\/service/, 'Service and support'],
  [/^\/fag/, 'Trades'],
];

function Linkified({ text }: { text: string }) {
  /* internal paths (/produkter, /butikker?tab=..., /produkt/slug) become
     styled Links; bare carl-ras.dk URLs become external links */
  const parts = text.split(/((?:https?:\/\/[^\s)]+)|(?:(?<=^|[\s(])\/[a-z0-9\-/]+(?:\?[a-z0-9=&\-]+)?))/gi);
  return (
    <>
      {parts.map((p, i) => {
        if (!p) return null;
        if (/^https?:\/\//i.test(p)) {
          return (
            <a key={i} href={p} target="_blank" rel="noopener noreferrer"
              className="text-stroxx-blue underline decoration-stroxx-blue/40 underline-offset-2 hover:decoration-stroxx-blue">
              {p.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}
            </a>
          );
        }
        if (/^\/[a-z0-9\-/]/i.test(p)) {
          const clean = p.replace(/[.,!;:]+$/, '');
          const trail = p.slice(clean.length);
          const label = PATH_LABELS.find(([re]) => re.test(clean))?.[1] || clean;
          return (
            <span key={i}>
              <Link href={clean}
                className="text-stroxx-blue underline decoration-stroxx-blue/40 underline-offset-2 hover:decoration-stroxx-blue">
                {label}
              </Link>
              {trail}
            </span>
          );
        }
        return <span key={i}>{p}</span>;
      })}
    </>
  );
}

function searchProducts(q: string) {
  const tokens = norm(q).split(/[^a-z0-9]+/).filter((t) => t.length >= 3 &&
    !['har', 'jeg', 'med', 'til', 'den', 'det', 'der', 'hvad', 'koster', 'pris', 'find', 'skal', 'bruge', 'bruger', 'noget', 'nogle', 'god', 'godt', 'jeres', 'vores', 'eller', 'ikke', 'bedste', 'hvilken', 'hvilke', 'mest',
      'the', 'and', 'you', 'your', 'have', 'has', 'got', 'need', 'want', 'some', 'good', 'cost', 'costs', 'price', 'with', 'for', 'find', 'what', 'which', 'best'].includes(t));
  if (!tokens.length) return [];
  const scored = products
    .map((p) => {
      const n = norm(p.name);
      const score = tokens.reduce((a, t) => a + (n.includes(t) ? 1 : 0), 0);
      return { p, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);
  return scored.slice(0, 3).map((x) => x.p);
}

function botReply(raw: string, nearest: { store: Store; km: number } | null, fallbackText: string): Msg[] {
  const t = norm(raw);

  // "ja"/"ja tak"/"gerne" accepts the bot's own handoff offer — without this
  // the fallback answer looped forever on an affirmative reply
  if (/menneske|specialist|human|person|ring til|tal med|snak med|talk|call|chat with|yes|yep|sure|please|^ja\b|^jep\b|^jo\b|gerne|ok(ay)?\b/.test(t)) {
    return [{
      from: 'bot', handoff: true,
      text: 'Of course. I have written a short summary of our chat, so you do not have to start over.',
    }];
  }
  if (/garanti|tilfreds|penge.*tilbage|retur|fortryd|bytte|guarantee|warranty|money.*back|refund|return|exchange|satisf/.test(t)) {
    return [{
      from: 'bot',
      text: 'STROXX comes with a 30-day satisfaction guarantee for business customers with an account. Not happy? You get your money back. No need to prove a fault, your judgment is enough. It covers all STROXX products except access control, and on bulk orders the first item bought.',
      links: [
        { label: 'About the guarantee', href: '/proev-det' },
        { label: 'The guarantee (PDF)', href: '/STROXX-tilfredshedsgaranti.pdf', external: true },
      ],
    }];
  }
  if (/butik|aabn|abningstid|adresse|naermest|hvor kan|hvor koeber|afhent|store|shop|open|hours|address|nearest|near me|where can|where do|pick ?up|buy/.test(t)) {
    if (nearest) {
      return [{
        from: 'bot',
        text: `Your nearest store is ${nearest.store.name}, ${nearest.store.address}, ${nearest.store.zipCity}, about ${nearest.km < 10 ? nearest.km.toFixed(1) : Math.round(nearest.km)} km from you. The store manager is ${nearest.store.manager.name}.`,
        links: [
          { label: 'See on the map', href: '/butikker' },
          { label: 'Directions', href: nearest.store.maps, external: true },
        ],
      }];
    }
    return [{
      from: 'bot',
      text: 'STROXX is sold in 26 stores across Denmark. The store finder locates the nearest one and shows opening hours and a direct line to the store manager.',
      links: [{ label: 'Find your store', href: '/butikker' }],
    }];
  }

  const hits = searchProducts(raw);
  if (hits.length) {
    return [{
      from: 'bot',
      text: hits.length === 1
        ? 'This is probably what you are after:'
        : 'I found a few picks in the range:',
      products: hits,
    }];
  }

  if (/pris|billig|spar|dyrt|koster|price|cheap|expensive|value|worth/.test(t)) {
    return [{
      from: 'bot',
      text: 'Short version: you pay for the tool, not for the logo. Same steel and the same tolerances as the A-brands. And if you cannot tell the difference, the guarantee has your back.',
      links: [{ label: 'See why', href: '/proev-det' }],
    }];
  }
  if (/^(hej|hejsa|goddag|hallo|hey|dav|hi|hello|yo)\b/.test(t)) {
    return [{ from: 'bot', text: 'Hi! Ask me about products, the guarantee or the stores. I keep it short, we are both on the clock.' }];
  }
  return [{
    from: 'bot',
    text: fallbackText,
    links: [],
    handoff: false,
    kind: 'fallback',
  }];
}

const GREETING_DEFAULT =
  'Hi! I am the STROXX AI assistant. Ask me about products, the guarantee or the stores, or ask for a human any time.';
const FALLBACK_DEFAULT =
  'I would rather not guess on that, it deserves a real answer. Want me to put you through to a specialist? Type "yes" and I will sort it.';

export default function SpecialistChat({
  nearest,
  greeting,
  fallbackText,
}: {
  nearest: { store: Store; km: number } | null;
  greeting?: string;
  fallbackText?: string;
}) {
  const [msgs, setMsgs] = useState<Msg[]>([{ from: 'bot', text: greeting || GREETING_DEFAULT }]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: 'smooth' });
  }, [msgs, typing]);

  const send = (text: string) => {
    const clean = text.trim();
    if (!clean || typing) return;
    const history = [...msgs, { from: 'user' as const, text: clean }];
    setMsgs((m) => [...m, { from: 'user', text: clean }]);
    setInput('');
    setTyping(true);
    const scripted = botReply(clean, nearest, fallbackText || FALLBACK_DEFAULT);
    const isFallback = scripted.length === 1 && scripted[0].kind === 'fallback';
    /* Question-shaped product queries ("hvad er den bedste laser?") deserve a
       real answer, not just a keyword card dump: send them to the AI and
       attach the matching product cards under its reply. Terse queries
       ("laser", "kniv") keep the instant scripted cards. */
    const isCards = scripted.length === 1 && !!scripted[0].products?.length;
    const questionLike =
      /\?/.test(clean) ||
      /^(hvad|hvilken?|hvilke|hvordan|hvorfor|kan|what|which|how|why|can|should|does|is|are)\b/i.test(clean.trim()) ||
      /bedste|best|anbefal|recommend/i.test(clean);
    if (!isFallback && !(isCards && questionLike)) {
      // the scripted answers (guarantee, stores, product cards, handoff) are
      // deliberate UX; only free-form questions go to the AI below
      setTimeout(() => {
        setMsgs((m) => [...m, ...scripted]);
        setTyping(false);
      }, 700 + Math.random() * 500);
      return;
    }
    (async () => {
      try {
        const payload = history
          .filter((m) => m.text)
          .slice(-8)
          .map((m) => ({ role: m.from === 'user' ? 'user' : 'assistant', content: m.text }));
        const r = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: payload }),
          signal: AbortSignal.timeout(22000),
        });
        if (r.ok) {
          const j = await r.json();
          if (j?.reply) {
            setMsgs((m) => [...m, { from: 'bot', text: j.reply, products: isCards ? scripted[0].products : undefined }]);
            setTyping(false);
            return;
          }
        }
      } catch {
        /* AI off or unreachable → scripted fallback below */
      }
      setMsgs((m) => [...m, ...scripted]);
      setTyping(false);
    })();
  };

  // human handoff brief, built from what the user actually wrote
  const brief = () => {
    const userLines = msgs.filter((m) => m.from === 'user').map((m) => m.text).slice(-4);
    return encodeURIComponent(
      `Enquiry from the stroxx.dk chat. The customer asked about: ${userLines.join(' · ') || 'general enquiry'}. Can you take it?`
    );
  };

  const ho = nearest?.store ?? null;

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* messages */}
      <div ref={scroller} data-lenis-prevent className="flex-1 min-h-0 overflow-y-auto sf-scroll pr-1 space-y-3">
        {msgs.map((m, i) => (
          <div key={i} className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-[13px] leading-relaxed ${
              m.from === 'user'
                ? 'bg-stroxx-blue text-white rounded-br-sm'
                : 'bg-white/[0.06] border border-white/10 text-white/90 rounded-bl-sm'
            }`}>
              {m.from === 'bot' ? <Linkified text={m.text} /> : m.text}
              {m.products && m.products.length > 0 && (
                <div className="mt-2.5 flex flex-col gap-2">
                  {m.products.map((p) => (
                    <Link key={p.slug} href={`/produkt/${p.slug}`}
                      className="group flex items-center gap-3 rounded-xl bg-ink/60 border border-white/10 p-2.5 hover:border-stroxx-blue/50 hover:bg-ink/80 transition-colors">
                      <span className="relative grid h-14 w-14 shrink-0 place-items-center rounded-lg bg-white/[0.04] border border-white/[0.06] overflow-hidden">
                        <span className="absolute inset-1 rounded-full" style={{ background: 'radial-gradient(circle, rgba(0,136,194,0.18), rgba(0,136,194,0) 70%)' }} />
                        <KnockoutImage src={toolTexture(p.imgId)} alt={p.name} className="relative z-10 h-11 w-11" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[12px] text-white leading-snug line-clamp-2">{p.name}</span>
                      </span>
                      <ArrowUpRight size={13} className="shrink-0 text-fog group-hover:text-stroxx-blue transition-colors" />
                    </Link>
                  ))}
                </div>
              )}
              {m.links && m.links.length > 0 && (
                <div className="mt-2.5 flex flex-col gap-1.5">
                  {m.links.map((l) => (
                    <a key={l.href + l.label} href={l.href}
                      target={l.external ? '_blank' : undefined}
                      rel={l.external ? 'noopener noreferrer' : undefined}
                      className="inline-flex items-center gap-1.5 text-[12px] text-stroxx-blue hover:underline">
                      {l.label} <ArrowUpRight size={11} />
                    </a>
                  ))}
                </div>
              )}
              {m.handoff && (
                <div className="mt-3 rounded-xl bg-ink/60 border border-white/10 p-3">
                  {ho ? (
                    <>
                      <div className="flex items-center gap-2.5 mb-2.5">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={ho.manager.photo} alt={ho.manager.name} className="h-9 w-9 rounded-full object-cover border border-white/15" />
                        <div className="min-w-0">
                          <div className="text-white text-[12px] leading-tight">{ho.manager.name}</div>
                          <div className="text-fog text-[11px]">{ho.name}</div>
                        </div>
                      </div>
                      <div className="flex gap-1.5">
                        <a href={`tel:${ho.manager.phone}`} className="glass-cta glass-cta--sm flex-1 justify-center text-white">
                          <Phone size={12} /> Call now
                        </a>
                        <a href={`https://wa.me/45${ho.manager.phone}?text=${brief()}`} target="_blank" rel="noopener noreferrer"
                          className="glass-cta glass-cta--ghost glass-cta--sm flex-1 justify-center text-white">
                          WhatsApp
                        </a>
                      </div>
                    </>
                  ) : (
                    <div className="flex gap-1.5">
                      <a href="tel:+4544855511" className="glass-cta glass-cta--sm flex-1 justify-center text-white">
                        <Phone size={12} /> Customer service 44 85 55 11
                      </a>
                    </div>
                  )}
                  <div className="mt-2 text-[10px] text-fog leading-snug">
                    The message includes a short summary of this chat, so you will not have to start over.
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        {typing && (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-bl-sm bg-white/[0.06] border border-white/10 px-4 py-3">
              <span className="inline-flex gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-fog animate-bounce [animation-delay:0ms]" />
                <span className="h-1.5 w-1.5 rounded-full bg-fog animate-bounce [animation-delay:140ms]" />
                <span className="h-1.5 w-1.5 rounded-full bg-fog animate-bounce [animation-delay:280ms]" />
              </span>
            </div>
          </div>
        )}
      </div>

      {/* quick chips */}
      <div data-lenis-prevent className="flex gap-1.5 overflow-x-auto sf-scroll py-3 shrink-0">
        {DEFAULT_CHIPS.map((c) => (
          <button key={c} onClick={() => send(c)}
            className="shrink-0 px-3 py-1.5 rounded-full text-[11px] bg-white/[0.05] border border-white/10 text-fog hover:text-white hover:border-white/25 transition-colors cursor-pointer">
            {c}
          </button>
        ))}
      </div>

      {/* input */}
      <form
        onSubmit={(e) => { e.preventDefault(); send(input); }}
        className="flex gap-2 shrink-0"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Write your question"
          aria-label="Write to the assistant"
          className="flex-1 rounded-full bg-white/[0.05] border border-white/10 px-4 py-2.5 text-base sm:text-[13px] text-white placeholder:text-fog/70 outline-none focus:border-stroxx-blue/60 transition-colors"
        />
        <button type="submit" aria-label="Send"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-stroxx-blue text-white border border-white/20 hover:scale-105 transition-transform cursor-pointer disabled:opacity-50"
          disabled={!input.trim() || typing}>
          <Send size={15} />
        </button>
      </form>
    </div>
  );
}
