'use client';
import { useEffect, useRef, useState } from 'react';
import { Send, Phone, ArrowUpRight } from 'lucide-react';
import { products } from '@/lib/data';
import { Store } from '@/lib/stores';

/** Demo AI chat: a scripted assistant that answers from the site's real data
 *  (guarantee terms, store list, live product catalogue) and can hand off to a
 *  human. The handoff composes a brief from the conversation and passes it to
 *  the nearest butikschef via call or prefilled WhatsApp, the same flow a
 *  production LLM + WhatsApp Business / Messenger integration would use. */

interface BtnLink { label: string; href: string; external?: boolean }
interface Msg { from: 'bot' | 'user'; text: string; links?: BtnLink[]; handoff?: boolean }

const DEFAULT_CHIPS = ['Hvordan virker garantien?', 'Find min butik', 'Har I en god kniv?', 'Snak med et menneske'];

const norm = (s: string) =>
  s.toLowerCase().replace(/ø/g, 'o').replace(/å/g, 'a').replace(/æ/g, 'ae');

function searchProducts(q: string) {
  const tokens = norm(q).split(/[^a-z0-9]+/).filter((t) => t.length >= 3 &&
    !['har', 'jeg', 'med', 'til', 'den', 'det', 'der', 'hvad', 'koster', 'pris', 'find', 'skal', 'bruge', 'bruger', 'noget', 'nogle', 'god', 'godt', 'jeres', 'vores', 'eller', 'ikke'].includes(t));
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

function botReply(raw: string, nearest: { store: Store; km: number } | null): Msg[] {
  const t = norm(raw);

  if (/menneske|specialist|human|person|ring til|tal med|snak med/.test(t)) {
    return [{
      from: 'bot', handoff: true,
      text: 'Selvfølgelig. Jeg har skrevet et kort resumé af vores samtale, så du ikke skal starte forfra.',
    }];
  }
  if (/garanti|tilfreds|penge.*tilbage|retur|fortryd|bytte/.test(t)) {
    return [{
      from: 'bot',
      text: 'STROXX har 30 dages tilfredshedsgaranti for erhvervskunder med konto. Er du ikke tilfreds, får du pengene tilbage. Ingen krav om fejl, din vurdering er nok. Gælder alle STROXX-produkter, dog ikke adgangskontrol, og ved mængdekøb den først købte vare.',
      links: [
        { label: 'Læs om garantien', href: '/proev-det' },
        { label: 'Garantien (PDF)', href: '/STROXX-tilfredshedsgaranti.pdf', external: true },
      ],
    }];
  }
  if (/butik|aabn|abningstid|adresse|naermest|hvor kan|hvor koeber|afhent/.test(t)) {
    if (nearest) {
      return [{
        from: 'bot',
        text: `Din nærmeste butik er ${nearest.store.name}, ${nearest.store.address}, ${nearest.store.zipCity}, cirka ${nearest.km < 10 ? nearest.km.toFixed(1) : Math.round(nearest.km)} km fra dig. Butikschefen hedder ${nearest.store.manager.name}.`,
        links: [
          { label: 'Se på kortet', href: '/butikker' },
          { label: 'Rutevejledning', href: nearest.store.maps, external: true },
        ],
      }];
    }
    return [{
      from: 'bot',
      text: 'STROXX sælges i 26 butikker over hele Danmark. Butiksoversigten kan finde den nærmeste for dig og vise åbningstider og direkte kontakt til butikschefen.',
      links: [{ label: 'Find din butik', href: '/butikker' }],
    }];
  }

  const hits = searchProducts(raw);
  if (hits.length) {
    return [{
      from: 'bot',
      text: hits.length === 1
        ? 'Det her er nok det, du leder efter:'
        : 'Jeg fandt et par bud i sortimentet:',
      links: hits.map((p) => ({
        label: `${p.name} · ${p.price} kr.`,
        href: `/produkt/${p.slug}`,
      })),
    }];
  }

  if (/pris|billig|spar|dyrt|koster/.test(t)) {
    return [{
      from: 'bot',
      text: 'Kort version: du betaler for værktøjet, ikke for logoet. Samme stål og samme tolerancer som A-mærkerne, typisk 40 til 50% billigere. Og kan du ikke mærke forskellen, dækker garantien.',
      links: [{ label: 'Se hvorfor', href: '/proev-det' }],
    }];
  }
  if (/^(hej|hejsa|goddag|hallo|hey|dav)\b/.test(t)) {
    return [{ from: 'bot', text: 'Hej! Spørg mig om produkter, priser, garantien eller butikkerne. Jeg svarer kort, vi er begge på arbejde.' }];
  }
  return [{
    from: 'bot',
    text: 'Det vil jeg ikke gætte på, det fortjener et rigtigt svar. Skal jeg sætte dig i kontakt med en specialist?',
    links: [],
    handoff: false,
  }];
}

export default function SpecialistChat({ nearest }: { nearest: { store: Store; km: number } | null }) {
  const [msgs, setMsgs] = useState<Msg[]>([
    { from: 'bot', text: 'Hej! Jeg er STROXX-assistenten. Spørg mig om produkter, garantien eller butikkerne, eller bed om et menneske når som helst.' },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: 'smooth' });
  }, [msgs, typing]);

  const send = (text: string) => {
    const clean = text.trim();
    if (!clean || typing) return;
    setMsgs((m) => [...m, { from: 'user', text: clean }]);
    setInput('');
    setTyping(true);
    setTimeout(() => {
      setMsgs((m) => [...m, ...botReply(clean, nearest)]);
      setTyping(false);
    }, 700 + Math.random() * 500);
  };

  // human handoff brief, built from what the user actually wrote
  const brief = () => {
    const userLines = msgs.filter((m) => m.from === 'user').map((m) => m.text).slice(-4);
    return encodeURIComponent(
      `Henvendelse fra stroxx.dk chatten. Kunden spurgte om: ${userLines.join(' · ') || 'generel forespørgsel'}. Tager du den?`
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
              {m.text}
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
                          <Phone size={12} /> Ring nu
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
                        <Phone size={12} /> Kundeservice 44 85 55 11
                      </a>
                    </div>
                  )}
                  <div className="mt-2 text-[10px] text-fog leading-snug">
                    Demo: i produktion overleveres samtalen automatisk, og specialisten ser resuméet før chatten fortsætter.
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
          placeholder="Skriv dit spørgsmål"
          aria-label="Skriv til assistenten"
          className="flex-1 rounded-full bg-white/[0.05] border border-white/10 px-4 py-2.5 text-[13px] text-white placeholder:text-fog/70 outline-none focus:border-stroxx-blue/60 transition-colors"
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
