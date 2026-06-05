'use client';

import { useEffect, useState } from 'react';
import { Download, Code, Smartphone, Monitor } from 'lucide-react';

/* Hidden internal page: previews the Marketo email templates shipped in
   /public/emails. For preview we rewrite a few things that only make sense
   inside Marketo:
   - absolute site links → relative (so images/links resolve locally)
   - {{lead.X:default=Y}} → Y
   - {{system.*}} → '#'
   The downloadable files are untouched and Marketo-ready. */

type Template = {
  file: string;
  title: string;
  subject: string;
  preheader: string;
  purpose: string;
  modules: string[];
};

const TEMPLATES: Template[] = [
  {
    file: 'stroxx-velkomst.html',
    title: '01 · Velkomst (Pro Club)',
    subject: 'Velkommen i klubben, {{lead.First Name}}',
    preheader: 'Tidlig adgang, specialist-tips og de skarpeste priser. Direkte i indbakken.',
    purpose:
      'Sendes ved tilmelding til Pro Club. Sætter forventninger (maks et par mails om måneden), viser de tre fordele og sender folk videre til produkterne, garantien og butikkerne.',
    modules: ['Hero + CTA', 'Tre fordele', 'Garanti-bånd', 'Find butik'],
  },
  {
    file: 'stroxx-produkt-streglaser.html',
    title: '02 · Hero-produkt (Streglaser 3D Green)',
    subject: 'Grønne linjer. Skarp pris. Streglaser 3D Green',
    preheader: 'Selvnivellerende 3D streglaser med 40 m rækkevidde. 2.498,75 kr. inkl. moms.',
    purpose:
      'Produktfokus: billede, specs, pris og to varianter. En specialist lægger ansigt og citat til, med direkte telefonnummer og links til specialister og butiksfinder. Primær CTA går til køb hos Carl Ras.',
    modules: ['Produkt-hero', 'Pris + CTA', 'Specs', 'Varianter', 'Specialist', 'Garanti-bånd'],
  },
  {
    file: 'stroxx-kampagne-proev-det.html',
    title: '03 · Kampagne (Prøv det i 30 dage)',
    subject: 'Prøv STROXX i 30 dage. Glad, eller pengene tilbage',
    preheader: 'Du betaler for logoet, ikke for stålet. Prøv det selv, helt uden risiko.',
    purpose:
      'Driver trafik til kampagnesiden /proev-det. Følger sidens fortælling: hook, tre trin, prisbevis og risk reversal. To CTA-niveauer: kampagnesiden øverst, butiksfinderen til sidst.',
    modules: ['Kampagne-hero + CTA', 'Tre trin', 'Beviset (2 produkter)', 'Afsluttende CTA'],
  },
];

function previewify(html: string) {
  return html
    .replaceAll('https://www.stroxx.dk', '')
    .replace(/\{\{lead\.[^:}]+:default=([^}]*)\}\}/g, '$1')
    .replace(/\{\{system\.[^}]+\}\}/g, '#');
}

function MacBookFrame({ html }: { html: string }) {
  return (
    <div className="w-full max-w-[760px]">
      {/* lid */}
      <div className="rounded-t-[14px] bg-gradient-to-b from-[#3A3C40] to-[#26282B] p-[7px] pb-0 shadow-2xl">
        <div className="rounded-t-[8px] bg-black px-1.5 pt-1.5">
          <div className="flex justify-center pb-1">
            <span className="h-[5px] w-[5px] rounded-full bg-[#1f2227] ring-1 ring-[#34373c]" />
          </div>
          <iframe
            title="Desktop preview"
            srcDoc={html}
            className="block h-[470px] w-full border-0 bg-[#EEEDEA]"
          />
        </div>
      </div>
      {/* base */}
      <div className="relative h-[14px] rounded-b-[14px] bg-gradient-to-b from-[#46484C] to-[#222428]">
        <div className="absolute left-1/2 top-0 h-[6px] w-[110px] -translate-x-1/2 rounded-b-[8px] bg-[#1B1D1F]" />
      </div>
    </div>
  );
}

function IPhoneFrame({ html }: { html: string }) {
  return (
    <div className="w-[312px] shrink-0 rounded-[48px] bg-gradient-to-b from-[#3A3C40] to-[#222428] p-[10px] shadow-2xl">
      <div className="relative overflow-hidden rounded-[38px] bg-[#EEEDEA]">
        {/* dynamic island */}
        <div className="pointer-events-none absolute left-1/2 top-2.5 z-10 h-[24px] w-[90px] -translate-x-1/2 rounded-full bg-black" />
        <iframe
          title="Mobile preview"
          srcDoc={html}
          className="block h-[620px] w-full border-0"
        />
        {/* home indicator */}
        <div className="pointer-events-none absolute bottom-1.5 left-1/2 z-10 h-[4px] w-[110px] -translate-x-1/2 rounded-full bg-black/70" />
      </div>
    </div>
  );
}

function TemplateSection({ t }: { t: Template }) {
  const [html, setHtml] = useState<string | null>(null);
  const [view, setView] = useState<'both' | 'desktop' | 'mobile'>('both');

  useEffect(() => {
    let alive = true;
    fetch(`/emails/${t.file}`)
      .then((r) => r.text())
      .then((raw) => alive && setHtml(previewify(raw)))
      .catch(() => alive && setHtml(null));
    return () => {
      alive = false;
    };
  }, [t.file]);

  const showDesktop = view !== 'mobile';
  const showMobile = view !== 'desktop';

  return (
    <section className="border-t border-line py-16">
      <div className="grid gap-10 lg:grid-cols-[340px_1fr]">
        {/* meta */}
        <div>
          <h2 className="font-display text-2xl font-bold text-white">{t.title}</h2>
          <p className="mt-3 text-sm leading-relaxed text-fog">{t.purpose}</p>

          <dl className="mt-6 space-y-3 text-sm">
            <div>
              <dt className="text-[11px] uppercase tracking-wider text-fog/60">Emnelinje</dt>
              <dd className="mt-0.5 text-white">{t.subject}</dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase tracking-wider text-fog/60">Preheader</dt>
              <dd className="mt-0.5 text-fog">{t.preheader}</dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase tracking-wider text-fog/60">Moduler (flytbare i Marketo)</dt>
              <dd className="mt-1.5 flex flex-wrap gap-1.5">
                {t.modules.map((m) => (
                  <span key={m} className="rounded-full border border-line px-2.5 py-1 text-xs text-fog">
                    {m}
                  </span>
                ))}
              </dd>
            </div>
          </dl>

          <div className="mt-6 flex flex-wrap gap-2">
            <a
              href={`/emails/${t.file}`}
              download
              className="inline-flex items-center gap-2 rounded-sm bg-stroxx-blue px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#0073B3]"
            >
              <Download size={15} /> Download HTML
            </a>
            <a
              href={`/emails/${t.file}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-sm border border-line px-4 py-2.5 text-sm text-fog transition-colors hover:text-white"
            >
              <Code size={15} /> Rå fil
            </a>
          </div>

          {/* view toggle */}
          <div className="mt-6 inline-flex rounded-sm border border-line p-1 text-xs">
            {(
              [
                ['both', 'Begge'],
                ['desktop', 'Desktop'],
                ['mobile', 'Mobil'],
              ] as const
            ).map(([v, label]) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`rounded-[2px] px-3 py-1.5 transition-colors ${
                  view === v ? 'bg-steel text-white' : 'text-fog hover:text-white'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* devices */}
        <div className="flex flex-wrap items-start justify-center gap-10 xl:justify-start">
          {html === null ? (
            <div className="text-sm text-fog">Indlæser forhåndsvisning…</div>
          ) : (
            <>
              {showDesktop && (
                <div>
                  <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-wider text-fog/60">
                    <Monitor size={13} /> Desktop · 600px e-mail
                  </div>
                  <MacBookFrame html={html} />
                </div>
              )}
              {showMobile && (
                <div>
                  <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-wider text-fog/60">
                    <Smartphone size={13} /> Mobil · responsivt layout
                  </div>
                  <IPhoneFrame html={html} />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}

export default function EmailPreviews() {
  return (
    <div className="mx-auto max-w-[1600px] px-6 pb-24 pt-32 md:px-10">
      <div className="max-w-3xl">
        <div className="eyebrow mb-4">Intern side · Marketo Engage</div>
        <h1 className="font-display text-4xl font-bold tracking-tightest text-white md:text-5xl">
          E-mail skabeloner
        </h1>
        <p className="mt-5 leading-relaxed text-fog">
          Tre Marketo-klare skabeloner bygget på Email Editor 2.0 syntaks: ét{' '}
          <code className="text-white/80">mktoContainer</code> med flytbare{' '}
          <code className="text-white/80">mktoModule</code>-sektioner og redigerbare{' '}
          <code className="text-white/80">mktoText</code>/<code className="text-white/80">mktoImg</code>-felter.
          Header og legal footer ligger uden for containeren, så de ikke kan slettes ved en fejl.
          Alle mails er 600px hybrid-layout med inline CSS, VML-knapper til Outlook og skjult preheader.
        </p>
        <p className="mt-3 leading-relaxed text-fog">
          Det juridiske er på plads i hver mail: permission-tekst (hvorfor du modtager den), fysisk
          adresse og CVR, afmeld-link via <code className="text-white/80">{'{{system.unsubscribeLink}}'}</code>,
          vis-i-browser via <code className="text-white/80">{'{{system.viewAsWebpageLink}}'}</code> og link til
          persondatapolitik. I forhåndsvisningen her er Marketo-tokens erstattet med deres standardværdier.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-fog/70">
          Import: Marketo → Design Studio → Email Templates → New Template → indsæt HTML → Approve.
          Billeder ligger på Carl Ras&apos; CDN og sitets eget domæne, så de virker direkte i udsendelser.
        </p>
      </div>

      <div className="mt-16">
        {TEMPLATES.map((t) => (
          <TemplateSection key={t.file} t={t} />
        ))}
      </div>
    </div>
  );
}
