import { defineArrayMember, defineField, defineType } from 'sanity';
import FilmPicker from '../FilmPicker';
import { langLabel, langPath } from '../lib/langLabel';

const accentNote = 'Wrap a word in *asterisks* for the blue accent. Line breaks are respected.';
const t = (name: string, title: string, rows = 2) =>
  defineField({ name, title, type: 'text', rows, description: rows <= 2 ? accentNote : undefined });
const s = (name: string, title: string) => defineField({ name, title, type: 'string' });

/** One collapsible, titled box per homepage section, numbered in the order
 *  the page scrolls, so the edit panel mirrors the page. Collapsed by default:
 *  opening the document shows the clean 10-section overview; clicking text on
 *  the page still jumps straight into (and expands) the right box. */
const fs = (name: string, title: string) => ({
  name,
  title,
  options: { collapsible: true, collapsed: true },
});

/** Per-market section switch: every section except the hero can be hidden.
 *  Defaults to on; the fallback layer treats "never touched" as on too. */
const show = (name: string, fieldset: string, group: string) =>
  defineField({
    name,
    title: 'Shown on the site',
    type: 'boolean',
    initialValue: true,
    description:
      'Toggle off to hide this whole section (markets differ). If a menu link points here, remove it too (Site settings → menus).',
    fieldset,
    group,
  });

/** Homepage copy (singleton). Layout, bag animation, particles, specialists
 *  and category data stay in code; this document owns the words. Every field
 *  left empty falls back to the built-in copy. */
export const homePage = defineType({
  name: 'homePage',
  title: 'Homepage',
  type: 'document',
  groups: [
    { name: 'hero', title: 'Hero + claim' },
    { name: 'range', title: 'Range + scale' },
    { name: 'proof', title: 'Specialists + guarantee' },
    { name: 'month', title: 'Month + categories + CTA' },
  ],
  fieldsets: [
    fs('fsHero', '1 · Hero (the giant headline)'),
    fs('fsClaim', '2 · Claim'),
    fs('fsMarquee', '3 · Marquee band'),
    fs('fsRange', '4 · The range (two columns)'),
    fs('fsScale', '5 · The scale + stats band'),
    fs('fsSpecialists', '6 · Specialists'),
    fs('fsFilm', '6b · Featured film'),
    fs('fsGuarantee', '7 · Guarantee'),
    fs('fsCampaign', '8 · Campaign photo band'),
    fs('fsMonth', '9 · Tool of the month'),
    fs('fsCategories', '10 · Categories + final CTA'),
  ],
  fields: [
    defineField({ name: 'language', type: 'string', readOnly: true, hidden: true }),
    defineField({
      ...t('heroHeadline', 'Hero headline', 3),
      description:
        'The giant front-page headline. Press Enter where the line should break; each line animates in separately. Wrap a word in *asterisks* for the blue accent.',
      group: 'hero',
      fieldset: 'fsHero',
    }),
    show('showClaim', 'fsClaim', 'hero'),
    defineField({ ...t('claim', 'Claim headline'), description: accentNote + ' The accented part renders blue.', group: 'hero', fieldset: 'fsClaim' }),
    defineField({ ...t('claimSub', 'Claim subtext', 4), group: 'hero', fieldset: 'fsClaim' }),
    show('showMarquee', 'fsMarquee', 'hero'),
    defineField({
      ...s('marqueeText', 'Marquee text'),
      description: 'The scrolling band. Wrap a word in *asterisks* for the blue accent.',
      group: 'hero',
      fieldset: 'fsMarquee',
    }),

    show('showRange', 'fsRange', 'range'),
    defineField({ ...t('rangeHeadline', 'Range headline', 3), group: 'range', fieldset: 'fsRange' }),
    defineField({ ...s('rangeCol1Label', 'Range column 1 label'), group: 'range', fieldset: 'fsRange' }),
    defineField({ ...t('rangeCol1Text', 'Range column 1 text', 4), group: 'range', fieldset: 'fsRange' }),
    defineField({ ...s('rangeCol2Label', 'Range column 2 label'), group: 'range', fieldset: 'fsRange' }),
    defineField({ ...t('rangeCol2Text', 'Range column 2 text', 4), group: 'range', fieldset: 'fsRange' }),
    show('showScale', 'fsScale', 'range'),
    defineField({ ...t('scaleHeadline', 'Scale headline', 3), group: 'range', fieldset: 'fsScale' }),
    defineField({ ...s('scaleCol1Label', 'Scale column 1 label'), group: 'range', fieldset: 'fsScale' }),
    defineField({ ...t('scaleCol1Text', 'Scale column 1 text', 4), group: 'range', fieldset: 'fsScale' }),
    defineField({ ...s('scaleCol2Label', 'Scale column 2 label'), group: 'range', fieldset: 'fsScale' }),
    defineField({ ...t('scaleCol2Text', 'Scale column 2 text', 4), group: 'range', fieldset: 'fsScale' }),
    defineField({
      name: 'stats',
      title: 'Stats cards',
      description: 'One glass card per number. Add, remove and drag to reorder; the row adapts to 1-4 cards.',
      group: 'range',
      fieldset: 'fsScale',
      type: 'array',
      validation: (r) => r.max(4),
      of: [
        defineArrayMember({
          type: 'object',
          name: 'stat',
          fields: [
            defineField({ name: 'value', title: 'Number', type: 'number', description: 'The big number itself; it counts up when scrolled into view.' }),
            defineField({ name: 'suffix', title: 'Suffix', type: 'string', description: 'E.g. + or %.' }),
            defineField({ name: 'label', title: 'Label', type: 'string', description: 'What the number counts, e.g. Item numbers.' }),
          ],
          preview: { select: { title: 'label' } },
        }),
      ],
    }),

    show('showSpecialists', 'fsSpecialists', 'proof'),
    defineField({ ...s('specialistsHeadline', 'Specialists headline'), description: accentNote, group: 'proof', fieldset: 'fsSpecialists' }),

    show('showFilm', 'fsFilm', 'proof'),
    defineField({ ...s('filmEyebrow', 'Film: eyebrow label'), group: 'proof', fieldset: 'fsFilm' }),
    defineField({ ...t('filmHeadline', 'Film: headline'), description: accentNote, group: 'proof', fieldset: 'fsFilm' }),
    defineField({
      name: 'films',
      title: 'Films',
      type: 'array',
      of: [defineArrayMember({ type: 'reference', to: [{ type: 'video' }] })],
      components: { input: FilmPicker },
      group: 'proof',
      fieldset: 'fsFilm',
      description: 'Pick the film(s) shown in this homepage section. Paste a YouTube link to add a new one. Empty = all active films.',
    }),

    show('showGuarantee', 'fsGuarantee', 'proof'),
    defineField({ ...t('guaranteeHeadline', 'Guarantee headline'), group: 'proof', fieldset: 'fsGuarantee' }),
    defineField({ ...t('guaranteeText', 'Guarantee text', 4), group: 'proof', fieldset: 'fsGuarantee' }),
    defineField({ name: 'sealLine1', title: 'Seal: line 1 (big)', type: 'string', group: 'proof', fieldset: 'fsGuarantee', description: 'The peeling guarantee sticker. Top word, e.g. SATISFIED (uppercase reads best).' }),
    defineField({ name: 'sealConnector', title: 'Seal: connector (small)', type: 'string', group: 'proof', fieldset: 'fsGuarantee', description: 'Small word between the two big lines, e.g. "or".' }),
    defineField({ name: 'sealLine2', title: 'Seal: line 2 (big)', type: 'string', group: 'proof', fieldset: 'fsGuarantee', description: 'e.g. REFUNDED.' }),
    defineField({ name: 'sealSub1', title: 'Seal: sub line 1', type: 'string', group: 'proof', fieldset: 'fsGuarantee' }),
    defineField({ name: 'sealSub2', title: 'Seal: sub line 2', type: 'string', group: 'proof', fieldset: 'fsGuarantee' }),

    show('showCampaign', 'fsCampaign', 'month'),
    defineField({ ...s('campaignEyebrow', 'Campaign band: eyebrow label'), group: 'month', fieldset: 'fsCampaign' }),
    defineField({ ...t('campaignHeadline', 'Campaign band: headline'), group: 'month', fieldset: 'fsCampaign' }),
    defineField({ ...t('campaignText', 'Campaign band: text', 4), group: 'month', fieldset: 'fsCampaign' }),
    defineField({ ...s('campaignPrimaryLabel', 'Campaign band: primary button label'), description: 'Optional override. Empty = automatic: “Buy at <dealer>” on a dealer market, “Where to buy” internationally. Keep the English base dealer-neutral, it renders on the international site.', group: 'month', fieldset: 'fsCampaign' }),
    defineField({ ...s('campaignSecondaryLabel', 'Campaign band: “read more” button label'), group: 'month', fieldset: 'fsCampaign' }),
    defineField({
      name: 'campaignLink',
      title: 'Campaign band: “read more” → campaign page',
      description:
        'The campaign landing page the band links to. SWAP THE CAMPAIGN by pointing this at a different page, or create a new Landing page (it publishes at /campaign/…) and select it here. Empty = links to the Try-it page.',
      type: 'reference',
      to: [{ type: 'landingPage' }],
      group: 'month',
      fieldset: 'fsCampaign',
    }),
    defineField({
      name: 'campaignImages',
      title: 'Campaign band photos (3 recommended)',
      description: 'The cinematic cross-fading photo series on the homepage. Leave empty for the built-in campaign shots.',
      type: 'array',
      group: 'month',
      fieldset: 'fsCampaign',
      validation: (r) => r.max(4),
      of: [{ type: 'image', options: { hotspot: true } }],
    }),
    show('showMonth', 'fsMonth', 'month'),
    defineField({ ...t('monthHeadline', 'Month section headline'), description: accentNote + ' The accented part renders blue.', group: 'month', fieldset: 'fsMonth' }),
    defineField({ ...t('monthText', 'Month section text', 4), group: 'month', fieldset: 'fsMonth' }),
    show('showCategories', 'fsCategories', 'month'),
    defineField({ ...t('categoriesHeadline', 'Categories headline'), group: 'month', fieldset: 'fsCategories' }),
    defineField({
      ...show('showFinalCta', 'fsCategories', 'month'),
      title: 'Final CTA shown',
      description: 'The closing full-screen call to action. Toggle off to hide it (markets differ).',
    }),
    defineField({ ...s('ctaLabel', 'Final CTA button label'), description: 'Keep dealer-neutral on the English base (it renders on the international site, where the button leads to Where to buy); a market’s own page may name its dealer.', group: 'month', fieldset: 'fsCategories' }),
  ],
  preview: {
    select: { language: 'language' },
    prepare: ({ language }: { language?: string }) => ({
      title: `Homepage (${langLabel(language)})`,
      subtitle: langPath(language) || '/',
    }),
  },
});
