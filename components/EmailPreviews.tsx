'use client';

import { useEffect, useRef, useState } from 'react';
import { Download, Code, Smartphone, Monitor, Info, X, ExternalLink } from 'lucide-react';
import { SITE_URL } from '@/lib/site';

/* Hidden internal page: presents the Marketo email templates from /public/emails
   one at a time, full screen, inside real device mockups (public/mockups).
   The mockup PNGs have transparent screen cut-outs, so the email iframe sits
   BEHIND the device image and shows through the screen.

   For preview we rewrite things that only make sense inside Marketo:
   absolute site links → relative, {{lead.X:default=Y}} → Y, {{system.*}} → '#'.
   The downloadable files are untouched and Marketo-ready. */

type Template = {
  file: string;
  no: string;
  name: string;
  subject: string;
  preheader: string;
};

const TEMPLATES: Template[] = [
  {
    file: 'stroxx-velkomst.html',
    no: '01',
    name: 'Velkomst',
    subject: 'Velkommen i klubben',
    preheader: 'Tidlig adgang, specialist-tips og de skarpeste priser. Direkte i indbakken.',
  },
  {
    file: 'stroxx-produkt-streglaser.html',
    no: '02',
    name: 'Produkt',
    subject: 'Grønne linjer. Skarp pris. Streglaser 3D Green',
    preheader: 'Selvnivellerende 3D streglaser med 40 m rækkevidde. 2.498,75 kr. inkl. moms.',
  },
  {
    file: 'stroxx-kampagne-proev-det.html',
    no: '03',
    name: 'Kampagne',
    subject: 'Dyrt værktøj. Til udyr pris.',
    preheader: 'Du betaler for logoet, ikke for stålet. Prøv det selv i 30 dage, helt uden risiko.',
  },
];

/* Screen cut-outs as fractions of each mockup image (measured pixel-exact). */
const MACBOOK = {
  src: '/mockups/macbook.png',
  imgW: 4704,
  imgH: 2836,
  hole: { left: 480 / 4704, top: 65 / 2836, width: 3742 / 4704, height: 2431 / 2836 },
  emailViewport: 1180, // CSS px the email "sees" → desktop layout
  contactShadow: true,
};
const IPHONE = {
  // tight crop of the hand mockup with the wrist alpha-faded into the backdrop
  src: '/mockups/iphone-hand.png',
  imgW: 1428,
  imgH: 1791,
  hole: { left: 0.15476, top: 0.03964, width: 0.44608, height: 0.79118 },
  emailViewport: 390, // iPhone width → mobile layout
  contactShadow: false,
};

const MARKETO_STEPS = [
  'Download HTML-filen herover.',
  'Log ind i Marketo Engage og gå til Design Studio → Email Templates.',
  'Vælg New → New Email Template, giv den et navn, og vælg Code Editor.',
  'Erstat al koden med indholdet fra den downloadede fil, og gem.',
  'Klik Preview for at tjekke den, og derefter Approve.',
  'Opret mailen under Marketing Activities → New Email og vælg skabelonen. Indsæt emnelinje og preheader herunder. Modulerne kan flyttes, dubleres og slettes, og al tekst og alle billeder redigeres direkte i editoren.',
];

function previewify(html: string) {
  return html
    .replaceAll(SITE_URL, '')
    .replaceAll('https://www.stroxx.dk', '')
    .replace(/\{\{lead\.[^:}]+:default=([^}]*)\}\}/g, '$1')
    .replace(/\{\{system\.[^}]+\}\}/g, '#');
}

/** Device mockup with the email iframe showing through the transparent screen,
 *  a soft blue backlight behind, and (for the MacBook) a contact shadow below. */
function Device({ spec, html, label }: { spec: typeof MACBOOK; html: string; label: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(0);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setW(el.clientWidth));
    ro.observe(el);
    setW(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  const holePxW = w * spec.hole.width;
  const scale = holePxW > 0 ? holePxW / spec.emailViewport : 0;
  const holePxH = w * (spec.imgH / spec.imgW) * spec.hole.height;

  return (
    <div ref={wrapRef} className="relative w-full" style={{ aspectRatio: `${spec.imgW} / ${spec.imgH}` }} aria-label={label}>
      {/* soft blue backlight */}
      <div
        aria-hidden
        className="pointer-events-none absolute"
        style={{
          inset: '-14% -18% -18%',
          background:
            'radial-gradient(48% 44% at 50% 52%, rgba(0,130,202,0.30), rgba(0,130,202,0.10) 52%, rgba(0,130,202,0) 74%)',
          filter: 'blur(10px)',
        }}
      />
      {/* contact shadow under the base */}
      {spec.contactShadow && (
        <div
          aria-hidden
          className="pointer-events-none absolute"
          style={{
            left: '9%',
            right: '9%',
            bottom: '-4.5%',
            height: '9%',
            background: 'radial-gradient(50% 55% at 50% 42%, rgba(0,0,0,0.78), rgba(0,0,0,0) 72%)',
            filter: 'blur(6px)',
          }}
        />
      )}
      {/* email behind the screen cut-out */}
      {scale > 0 && (
        <div
          className="absolute overflow-hidden bg-[#060708]"
          style={{
            left: `${spec.hole.left * 100}%`,
            top: `${spec.hole.top * 100}%`,
            width: `${spec.hole.width * 100}%`,
            height: `${spec.hole.height * 100}%`,
          }}
        >
          <iframe
            title={label}
            srcDoc={html}
            style={{
              width: spec.emailViewport,
              height: holePxH / scale,
              transform: `scale(${scale})`,
              transformOrigin: '0 0',
              border: 0,
              display: 'block',
            }}
          />
        </div>
      )}
      {/* device on top, screen is transparent */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={spec.src}
        alt=""
        className="pointer-events-none absolute inset-0 z-10 h-full w-full select-none"
        style={{ filter: 'drop-shadow(0 34px 50px rgba(0,0,0,0.55)) drop-shadow(0 10px 18px rgba(0,0,0,0.45))' }}
        draggable={false}
      />
    </div>
  );
}

function CopyField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard?.writeText(value).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1600);
        });
      }}
      className="block w-full rounded-lg border border-line bg-ink/60 px-4 py-3 text-left transition-colors hover:border-fog/50"
      title="Klik for at kopiere"
    >
      <span className="block text-[11px] uppercase tracking-wider text-fog/60">
        {label} {copied && <span className="text-stroxx-blue normal-case tracking-normal">· kopieret</span>}
      </span>
      <span className="mt-0.5 block text-sm text-white">{value}</span>
    </button>
  );
}

export default function EmailPreviews() {
  const [idx, setIdx] = useState(0);
  const [view, setView] = useState<'desktop' | 'mobile'>('desktop');
  const [infoOpen, setInfoOpen] = useState(false);
  const [htmls, setHtmls] = useState<Record<string, string>>({});

  const t = TEMPLATES[idx];
  const html = htmls[t.file];

  useEffect(() => {
    let alive = true;
    TEMPLATES.forEach(({ file }) => {
      fetch(`/emails/${file}`)
        .then((r) => r.text())
        .then((raw) => alive && setHtmls((h) => ({ ...h, [file]: previewify(raw) })))
        .catch(() => undefined);
    });
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="relative flex min-h-[100dvh] flex-col overflow-hidden">
      {/* stage backdrop: keynote spotlight */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(900px 540px at 50% 38%, rgba(0,130,202,0.10), rgba(11,12,14,0) 65%), radial-gradient(1400px 800px at 50% 110%, rgba(255,255,255,0.04), rgba(11,12,14,0) 60%)',
        }}
      />

      {/* slide header */}
      <div className="relative z-10 px-6 pt-28 text-center md:pt-32">
        <div className="eyebrow mb-3">Marketo e-mail skabeloner</div>
        <h1
          key={`h-${idx}`}
          className="email-fade font-display text-3xl font-bold tracking-tightest text-white md:text-4xl"
        >
          {t.no} · {t.name}
        </h1>
        <p key={`s-${idx}`} className="email-fade mx-auto mt-2 max-w-xl text-sm text-fog">
          Emne: {t.subject}
        </p>
      </div>

      {/* stage */}
      <div className="relative z-10 flex flex-1 items-center justify-center px-4 pb-44 pt-10 md:px-10">
        {!html ? (
          <div className="text-sm text-fog">Indlæser…</div>
        ) : view === 'desktop' ? (
          <div key={`d-${idx}`} className="email-rise w-full max-w-[min(1100px,88vw,calc((100dvh-330px)*1.659))]">
            <Device spec={MACBOOK} html={html} label={`${t.name}, desktop`} />
          </div>
        ) : (
          <div key={`m-${idx}`} className="email-rise w-full max-w-[min(640px,50vw,calc((100dvh-320px)*0.797))] max-sm:max-w-[88vw]">
            <Device spec={IPHONE} html={html} label={`${t.name}, mobil`} />
          </div>
        )}
      </div>

      {/* floating control bar */}
      <div className="fixed bottom-6 left-1/2 z-40 -translate-x-1/2">
        <div className="glass-panel flex items-center gap-1 rounded-full px-2 py-2">
          {TEMPLATES.map((tpl, i) => (
            <button
              key={tpl.file}
              onClick={() => setIdx(i)}
              className={`rounded-full px-3.5 py-2 text-xs font-semibold transition-colors md:px-4 md:text-sm ${
                i === idx ? 'bg-stroxx-blue text-white' : 'text-fog hover:text-white'
              }`}
              aria-pressed={i === idx}
            >
              <span className="opacity-60">{tpl.no}</span>
              <span className="ml-1.5 hidden sm:inline">{tpl.name}</span>
            </button>
          ))}

          <span className="mx-1 h-6 w-px bg-white/10" aria-hidden />

          <button
            onClick={() => setView('desktop')}
            className={`flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold transition-colors md:text-sm ${
              view === 'desktop' ? 'bg-white/10 text-white' : 'text-fog hover:text-white'
            }`}
            aria-pressed={view === 'desktop'}
          >
            <Monitor size={15} /> <span className="hidden sm:inline">Desktop</span>
          </button>
          <button
            onClick={() => setView('mobile')}
            className={`flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold transition-colors md:text-sm ${
              view === 'mobile' ? 'bg-white/10 text-white' : 'text-fog hover:text-white'
            }`}
            aria-pressed={view === 'mobile'}
          >
            <Smartphone size={15} /> <span className="hidden sm:inline">Mobil</span>
          </button>

          <span className="mx-1 h-6 w-px bg-white/10" aria-hidden />

          <button
            onClick={() => setInfoOpen(true)}
            className="flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold text-fog transition-colors hover:text-white md:text-sm"
          >
            <Info size={15} /> <span className="hidden sm:inline">Info</span>
          </button>
        </div>
      </div>

      {/* info panel: grab the files + add them to Marketo */}
      {infoOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" role="dialog" aria-modal="true">
          <button aria-label="Luk" className="absolute inset-0 bg-black/60" onClick={() => setInfoOpen(false)} />
          <div className="glass-panel email-rise relative m-0 max-h-[85dvh] w-full max-w-2xl overflow-y-auto rounded-t-2xl p-7 sm:m-6 sm:rounded-2xl md:p-9">
            <button
              onClick={() => setInfoOpen(false)}
              className="absolute right-5 top-5 text-fog transition-colors hover:text-white"
              aria-label="Luk info"
            >
              <X size={18} />
            </button>

            <div className="eyebrow mb-2">
              {t.no} · {t.name}
            </div>
            <h2 className="font-display text-2xl font-bold text-white">Brug skabelonen i Marketo</h2>

            <div className="mt-5 flex flex-wrap gap-2">
              <a
                href={`/emails/${t.file}`}
                download
                className="inline-flex items-center gap-2 rounded-full bg-stroxx-blue px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0073B3]"
              >
                <Download size={15} /> Download HTML
              </a>
              <a
                href={`/emails/${t.file}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-line px-5 py-2.5 text-sm text-fog transition-colors hover:text-white"
              >
                <Code size={15} /> Se r&aring; fil
              </a>
            </div>

            <ol className="mt-7 space-y-3">
              {MARKETO_STEPS.map((step, i) => (
                <li key={i} className="flex gap-3 text-sm leading-relaxed text-fog">
                  <span className="font-display font-bold text-stroxx-blue">{String(i + 1).padStart(2, '0')}</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>

            <div className="mt-6 space-y-2">
              <CopyField label="Emnelinje" value={t.subject} />
              <CopyField label="Preheader" value={t.preheader} />
            </div>

            <p className="mt-6 border-t border-line pt-5 text-[13px] leading-relaxed text-fog/70">
              Alle billeder ligger p&aring; faste URL&apos;er (sitet og Carl Ras&apos; CDN), s&aring; de virker direkte i
              udsendelser uden upload. Afmeld-link, vis-i-browser og firmaoplysninger er indbygget i footeren og
              kan ikke slettes ved en fejl.{' '}
              <a
                href="https://business.adobe.com/products/marketo/adobe-marketo.html"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-stroxx-blue hover:underline"
              >
                Om Adobe Marketo Engage <ExternalLink size={11} />
              </a>
            </p>
          </div>
        </div>
      )}

      {/* slide transitions */}
      <style>{`
        @keyframes emailFade { from { opacity:0; transform: translateY(6px); } to { opacity:1; transform:none; } }
        @keyframes emailRise { from { opacity:0; transform: translateY(18px) scale(.985); } to { opacity:1; transform:none; } }
        .email-fade { animation: emailFade .45s cubic-bezier(.16,1,.3,1) both; }
        .email-rise { animation: emailRise .6s cubic-bezier(.16,1,.3,1) both; }
        @media (prefers-reduced-motion: reduce) { .email-fade, .email-rise { animation: none; } }
      `}</style>
    </div>
  );
}
