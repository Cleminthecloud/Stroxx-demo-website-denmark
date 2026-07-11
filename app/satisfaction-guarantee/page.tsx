import type { Metadata } from 'next';
import LegalBody from '@/components/LegalBody';

export const metadata: Metadata = {
  title: 'The 30-day satisfaction guarantee',
  description:
    'The full terms of the STROXX 30-day satisfaction guarantee: money back if you are not satisfied, no need to prove a fault.',
  alternates: { canonical: '/satisfaction-guarantee' },
};

/** The guarantee terms as an editable CMS page (a `legalPage` document, like
 *  /privacy and /terms). This REPLACED the static Danish PDF
 *  (public/STROXX-tilfredshedsgaranti.pdf) on 2026-07-11 — the old PDF URL
 *  301s here via next.config.mjs redirects(). Each market can translate its
 *  own version through document internationalization. */
export default function Page() {
  return <LegalBody slug="satisfaction-guarantee" fallbackTitle="30-day satisfaction guarantee" eyebrow="Guarantee" />;
}
