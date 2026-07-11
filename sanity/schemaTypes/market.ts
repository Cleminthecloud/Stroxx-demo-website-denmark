import { defineArrayMember, defineField, defineType } from 'sanity';

const LANGS = [
  { title: 'Danish', value: 'da' },
  { title: 'German', value: 'de' },
  { title: 'Dutch', value: 'nl' },
  { title: 'French', value: 'fr' },
  { title: 'English', value: 'en' },
  { title: 'Spanish', value: 'es' },
];

/** A market is a country the STROXX brand site serves: its dealer, its "Buy at"
 *  CTA, its language(s) and its URL code. The international English version is a
 *  market too, flagged as the reference/fallback and served at the root.
 *
 *  Structural, per-market facts live here (language-independent). Translatable
 *  copy lives in the localised content documents; a market with two languages
 *  (Belgium: nl + fr) shares one market document. See
 *  docs/STROXX-market-localisation-plan.md. */
export const market = defineType({
  name: 'market',
  title: 'Market',
  type: 'document',
  fieldsets: [
    { name: 'identity', title: 'Market identity + routing', options: { collapsible: true, collapsed: false } },
    {
      name: 'dealer',
      title: 'Dealer (Where to buy)',
      description:
        'The buy contract: every Buy button in this market points at THIS dealer. Empty dealer fields on the international market are correct, its buttons open the dealer chooser instead. Never point one market at another market\'s shop.',
      options: { collapsible: true, collapsed: false },
    },
    { name: 'footer', title: 'Footer contact + legal', options: { collapsible: true, collapsed: false } },
  ],
  fields: [
    defineField({ name: 'name', title: 'Market name', type: 'string', fieldset: 'identity', description: 'e.g. Denmark, Germany, International (English).', validation: (r) => r.required() }),
    defineField({
      name: 'code',
      title: 'URL code',
      type: 'slug',
      fieldset: 'identity',
      description: 'The path segment, e.g. "dk" gives /dk. The reference market is served at the root.',
      options: { source: 'name' },
      validation: (r) =>
        r.required().custom((v) => {
          const c = (v as { current?: string } | undefined)?.current;
          return c && /^[a-z]{2,5}$/.test(c) ? true : 'Two to five lowercase letters (e.g. dk, de, fr, be, int)';
        }),
    }),
    defineField({
      name: 'languages',
      title: 'Languages',
      type: 'array',
      fieldset: 'identity',
      description: 'Which languages this market publishes in (Belgium has two: nl + fr). Informational: routing is code-owned in lib/i18n.ts.',
      of: [defineArrayMember({ type: 'string' })],
      options: { list: LANGS },
      validation: (r) => r.required().min(1),
    }),
    defineField({ name: 'defaultLanguage', title: 'Default language', type: 'string', fieldset: 'identity', description: 'The language shown first for this market. Informational: routing and language resolution are code-owned in lib/i18n.ts.', options: { list: LANGS } }),
    defineField({ name: 'isReference', title: 'Reference / international (served at root)', type: 'boolean', fieldset: 'identity', initialValue: false, description: 'The English international version: the fallback and hreflang x-default. Exactly one market has this on.' }),
    defineField({ name: 'active', title: 'Live', type: 'boolean', fieldset: 'identity', initialValue: false, description: 'Informational for now: which markets count as launched. Site visibility is code-owned (lib/i18n.ts) and the dealer chooser deliberately lists every dealer; gating by this flag is a market-launch build item.' }),
    defineField({ name: 'dealerName', title: 'Dealer / distributor', type: 'string', fieldset: 'dealer', description: 'e.g. Carl Ras, Meesenburg, Foussier, Lecot. Deliberately EMPTY on the international (reference) market: it has no single dealer, so its Buy buttons open the dealer chooser instead.' }),
    defineField({ name: 'dealerCtaUrl', title: 'Buy-at CTA link', type: 'url', fieldset: 'dealer', description: 'Where the "Buy at <dealer>" button points for this market. If empty, Buy buttons fall back to the dealer chooser, never another market’s shop. Empty is correct on the international market.' }),
    defineField({ name: 'supportPhone', title: 'Customer service phone', type: 'string', fieldset: 'footer' }),
    defineField({ name: 'supportHours', title: 'Customer service hours', type: 'string', fieldset: 'footer' }),
    defineField({ name: 'legalLine', title: 'Footer legal line (local HQ)', type: 'string', fieldset: 'footer', description: 'The dealer / HQ address shown at the bottom of the footer for this market, e.g. "© Meesenburg GmbH & Co. KG | Westerallee 162 | 24941 Flensburg". The international (reference) version shows a neutral STROXX line.' }),
    defineField({
      name: 'legalLinks',
      title: 'Legal links',
      type: 'array',
      fieldset: 'footer',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'legalLink',
          fields: [
            defineField({ name: 'label', title: 'Label', type: 'string' }),
            defineField({ name: 'href', title: 'Link', type: 'string' }),
          ],
          preview: { select: { title: 'label', subtitle: 'href' } },
        }),
      ],
    }),
    defineField({ name: 'order', title: 'Sort order', type: 'number', fieldset: 'identity', initialValue: 0, description: 'Order in the market/language switcher.' }),
  ],
  preview: {
    select: { name: 'name', code: 'code.current', langs: 'languages', ref: 'isReference', active: 'active' },
    prepare: ({ name, code, langs, ref, active }) => ({
      title: `${name || 'Market'}${ref ? ' · reference' : ''}`,
      subtitle: `/${code || '…'} · ${(Array.isArray(langs) ? langs.join(', ') : '') || 'no languages'}${active ? '' : ' · not live'}`,
    }),
  },
});
