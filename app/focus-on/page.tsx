import type { Metadata } from 'next';
import Reveal from '@/components/Reveal';
import FocusIndex from '@/components/focus/FocusIndex';
import { getFocusCards } from '@/lib/cms';
import { getLocale, getLocalePrefix } from '@/lib/locale';
import { focusCopy } from '@/lib/focus-copy';
import { focusFacets, focusStatuses, formatFocusMonth, localizeHref, parseFocusFilter, sortFocus } from '@/lib/focus';

/** /focus-on — "Focus on…" (Fokus på…): every focus product page, newest
 *  month first, filterable by category (and by topic and year once there are
 *  enough of them). Replaces the Webflow /fokus-paa overview built on CMS +
 *  Finsweet Attributes; here the list and its filters come straight from the
 *  focusPage documents, so a new page appears the moment it is published. */

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = focusCopy(locale.htmlLang);
  return {
    title: t.overviewTitle.replace('…', ''),
    description: t.overviewIntro,
    alternates: { canonical: '/focus-on' },
  };
}

export default async function FocusOverview({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const [cards, locale, prefix, sp] = await Promise.all([getFocusCards(), getLocale(), getLocalePrefix(), searchParams]);
  const t = focusCopy(locale.htmlLang);
  const sorted = sortFocus(cards);
  const today = new Date().toISOString().slice(0, 10);
  const statuses = Object.fromEntries(focusStatuses(sorted, today));
  const monthLabels = Object.fromEntries(sorted.map((c) => [c._id, formatFocusMonth(c.month, locale.htmlLang)]));
  const hrefs = Object.fromEntries(sorted.map((c) => [c._id, localizeHref(`/focus-on/${c.slug}`, prefix)]));
  const params = { get: (k: string) => (typeof sp?.[k] === 'string' ? (sp[k] as string) : null) };
  const initial = parseFocusFilter(params, focusFacets(sorted));

  return (
    <main className="bg-ink">
      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: 'radial-gradient(60% 70% at 15% 0%, rgba(0,136,194,0.16), transparent 70%)' }}
        />
        <div className="relative mx-auto max-w-[1600px] px-6 pb-12 pt-36 md:px-10 md:pb-16 md:pt-44">
          <Reveal>
            <div className="eyebrow mb-6">STROXX</div>
            <h1 className="h-display mb-6 text-[clamp(2.8rem,8vw,6.5rem)] leading-[0.92] text-white">{t.overviewTitle}</h1>
            <p className="max-w-2xl text-lg leading-relaxed text-fog md:text-xl">{t.overviewIntro}</p>
          </Reveal>
        </div>
      </section>
      <section className="relative">
        <div className="mx-auto max-w-[1600px] px-6 pb-28 md:px-10 md:pb-36">
          <FocusIndex
            cards={sorted}
            statuses={statuses}
            monthLabels={monthLabels}
            hrefs={hrefs}
            initial={initial}
            htmlLang={locale.htmlLang}
          />
        </div>
      </section>
    </main>
  );
}
