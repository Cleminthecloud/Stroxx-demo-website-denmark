'use client';

import { useEffect, useRef, useState } from 'react';
import { Download, Code, Smartphone, Monitor, Info, X } from 'lucide-react';

/* Hidden internal page: presents the Marketo email templates from /public/emails
   one at a time, full screen, inside real device mockups (public/mockups).
   The mockup PNGs have transparent screen cut-outs, so the email iframe sits
   BEHIND the device image and shows through the screen.

   Measured screen holes (fractions of the PNG):
   - macbook.png  4704x2836: x 480-4222, y 65-2496
   - hand-holding-phone...png 2000x2000: x 613-1250, y 280-1697

   For preview we rewrite things that only make sense inside Marketo:
   absolute site links → relative, {{lead.X:default=Y}} → Y, {{system.*}} → '#'.
   The downloadable files are untouched and Marketo-ready. */

type Template = {
  file: string;
  no: string;
  name: string;
  subject: string;
  preheader: string;
  purpose: string;
  modules: string[];
};

const TEMPLATES: Template[] = [
  {
    file: 'stroxx-velkomst.html',
    no: '01',
    name: 'Velkomst',
    subject: 'Velkommen i klubben',
    preheader: 'Tidlig adgang, specialist-tips og de skarpeste priser. Direkte i indbakken.',
    purpose:
      'Sendes ved tilmelding til Pro Club. Sætter forventninger (maks et par mails om måneden), viser de tre fordele og sender folk videre til produkterne, garantien og butikkerne.',
    modules: ['Hero + CTA', 'Tre fordele', 'Garanti-bånd', 'Find butik'],
  },
  {
    file: 'stroxx-produkt-streglaser.html',
    no: '02',
    name: 'Produkt',
    subject: 'Grønne linjer. Skarp pris. Streglaser 3D Green',
    preheader: 'Selvnivellerende 3D streglaser med 40 m rækkevidde. 2.498,75 kr. inkl. moms.',
    purpose:
      'Produktfokus: cut-out billede, specs, pris og to varianter som produktkort i sitets stil. En specialist lægger ansigt og citat til, med direkte telefonnummer og links til specialister og butiksfinder. Primær CTA går til køb hos Carl Ras.',
    modules: ['Produkt-hero', 'Pris + CTA', 'Specs', 'Varianter (produktkort)', 'Specialist', 'Garanti-bånd'],
  },
  {
    file: 'stroxx-kampagne-proev-det.html',
    no: '03',
    name: 'Kampagne',
    subject: 'Prøv STROXX i 30 dage. Glad, eller pengene tilbage',
    preheader: 'Du betaler for logoet, ikke for stålet. Prøv det selv, helt uden risiko.',
    purpose:
      'Driver trafik til kampagnesiden /proev-det. Følger sidens fortælling: hook, tre trin, prisbevis som produktkort og risk reversal. To CTA-niveauer: kampagnesiden øverst, butiksfinderen til sidst.',
    modules: ['Kampagne-hero + CTA', 'Tre trin', 'Beviset (produktkort)', 'Afsluttende CTA'],
  },
];

/* Screen cut-outs as fractions of each mockup image. */
const MACBOOK = {
  src: '/mockups/macbook.png',
  imgW: 4704,
  imgH: 2836,
  hole: { left: 480 / 4704, top: 65 / 2836, width: 3742 / 4704, height: 2431 / 2836 },
  emailViewport: 1180, // CSS px the email "sees" → desktop layout
};
const IPHONE = {
  src: '/mockups/hand-holding-phone-with-blank-screen.png',
  imgW: 2000,
  imgH: 2000,
  hole: { left: 613 / 2000, top: 280 / 2000, width: 637 / 2000, height: 1417 / 2000 },
  emailViewport: 390, // iPhone width → mobile layout
};

function previewify(html: string) {
  return html
    .replaceAll('https://www.stroxx.dk', '')
    .replace(/\{\{lead\.[^:}]+:default=([^}]*)\}\}/g, '$1')
    .replace(/\{\{system\.[^}]+\}\}/g, '#');
}

/** Device mockup with the email iframe showing through the transparent screen. */
function Device({
  spec,
  html,
  label,
}: {
  spec: typeof MACBOOK;
  html: string;
  label: string;
}) {
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
        style={{ filter: 'drop-shadow(0 50px 70px rgba(0,0,0,0.65)) drop-shadow(0 16px 28px rgba(0,0,0,0.5))' }}
        draggable={false}
      />
    </div>
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
            'radial-gradient(900px 540px at 50% 38%, rgba(0,130,202,0.13), rgba(11,12,14,0) 65%), radial-gradient(1400px 800px at 50% 110%, rgba(255,255,255,0.04), rgba(11,12,14,0) 60%)',
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
      <div className="relative z-10 flex flex-1 items-center justify-center px-4 pb-40 pt-8 md:px-10">
        {!html ? (
          <div className="text-sm text-fog">Indlæser…</div>
        ) : view === 'desktop' ? (
          <div key={`d-${idx}`} className="email-rise w-full max-w-[min(1100px,88vw,calc((100dvh-330px)*1.659))]">
            <Device spec={MACBOOK} html={html} label={`${t.name}, desktop`} />
          </div>
        ) : (
          <div key={`m-${idx}`} className="email-rise w-full max-w-[min(560px,80vw,calc(100dvh-330px))]">
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

      {/* info panel */}
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
            <h2 className="font-display text-2xl font-bold text-white">{t.subject}</h2>
            <p className="mt-1.5 text-sm text-fog">Preheader: {t.preheader}</p>
            <p className="mt-4 text-sm leading-relaxed text-fog">{t.purpose}</p>

            <div className="mt-5 flex flex-wrap gap-1.5">
              {t.modules.map((m) => (
                <span key={m} className="rounded-full border border-line px-2.5 py-1 text-xs text-fog">
                  {m}
                </span>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
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
                <Code size={15} /> Rå fil
              </a>
            </div>

            <div className="mt-7 border-t border-line pt-5 text-[13px] leading-relaxed text-fog/80">
              <p>
                Skabelonerne er bygget til Marketo Email Editor 2.0: ét{' '}
                <code className="text-white/80">mktoContainer</code> med flytbare{' '}
                <code className="text-white/80">mktoModule</code>-sektioner og redigerbare{' '}
                <code className="text-white/80">mktoText</code>/<code className="text-white/80">mktoImg</code>-felter.
                Header og legal footer ligger uden for containeren, så de ikke kan slettes ved en fejl. 600px
                hybrid-layout, inline CSS og VML-knapper til Outlook.
              </p>
              <p className="mt-3">
                Jura i hver mail: permission-tekst, fysisk adresse og CVR, afmeld via{' '}
                <code className="text-white/80">{'{{system.unsubscribeLink}}'}</code>, vis-i-browser via{' '}
                <code className="text-white/80">{'{{system.viewAsWebpageLink}}'}</code> og link til
                persondatapolitik. I forhåndsvisningen er tokens erstattet med standardværdier.
              </p>
              <p className="mt-3">
                Produktbilleder bruger sitets cut-out proxy (<code className="text-white/80">/api/tool/&#123;id&#125;</code>),
                som skiftes til rigtige DAM-PNG&apos;er, når API-adgangen lander. Import: Marketo → Design Studio →
                Email Templates → New Template → indsæt HTML → Approve.
              </p>
            </div>
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
