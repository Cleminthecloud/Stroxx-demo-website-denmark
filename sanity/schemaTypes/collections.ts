import { defineArrayMember, defineField, defineType } from 'sanity';
import SkuInput from '../SkuInput';
import { langLabel } from '../lib/langLabel';
import { CATEGORY_OPTIONS } from './trade';

/** Keep in sync with the trade documents' slugs (lib/trades.ts fallbacks). */
const TRADE_OPTIONS = [
  { title: 'Carpenter (toemrer)', value: 'carpenter' },
  { title: 'Electrician (elektriker)', value: 'electrician' },
  { title: 'Plumber (vvs)', value: 'plumber' },
  { title: 'Mason (murer)', value: 'bricklayer' },
  { title: 'Painter (maler)', value: 'painter' },
];

/** The people, voices, films and legal texts of the site, each a small
 *  collection editors own. All have hardcoded fallbacks in code, so an empty
 *  collection never blanks a page. */

export const specialist = defineType({
  name: 'specialist',
  title: 'Specialist',
  type: 'document',
  description:
    'The trade specialists shown on the homepage cards and product pages. One set per language/market: each market shows its own people. To reuse one in another market, open it and add that language under Translations.',
  fields: [
    defineField({ name: 'language', type: 'string', readOnly: true, hidden: true }),
    defineField({ name: 'name', title: 'Name', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'role', title: 'Role', type: 'string' }),
    defineField({ name: 'location', title: 'Location', type: 'string' }),
    defineField({
      name: 'photoUpload',
      title: 'Photo (upload or pick from media library)',
      type: 'image',
      options: { hotspot: true },
      description: 'Preferred. B&W portrait; overrides the path below when set.',
    }),
    defineField({
      name: 'photoUrl',
      title: 'Photo path or URL (fallback)',
      type: 'string',
      description: 'Path under /public (e.g. /specialists/name.jpg) or full URL.',
    }),
    defineField({ name: 'phone', title: 'Direct phone', type: 'string' }),
    defineField({ name: 'email', title: 'Email', type: 'string' }),
    defineField({ name: 'quote', title: 'Quote', type: 'text', rows: 3 }),
    defineField({
      name: 'quoteTopic',
      title: 'Quote topic (product category)',
      type: 'string',
      options: { list: CATEGORY_OPTIONS },
      description:
        'IMPORTANT: if the quote names a product or category, pick that category here so the quote only shows on matching product pages. Leave empty for brand-generic quotes that are safe anywhere.',
    }),
    defineField({
      name: 'consentGiven',
      title: 'Consent given (photo + direct contact on the web)',
      type: 'boolean',
      initialValue: false,
      description: 'Must be ON before the photo and direct contact details appear on the site; while it is off, the site quietly hides them.',
      validation: (r) =>
        r
          .custom((consent, context) => {
            const doc = context.document as
              | { photoUpload?: unknown; photoUrl?: string; phone?: string; email?: string }
              | undefined;
            const hasDetails = Boolean(doc?.photoUpload || doc?.photoUrl || doc?.phone || doc?.email);
            return !consent && hasDetails
              ? 'A photo or direct contact detail is filled in but consent is off, so the site will hide this person.'
              : true;
          })
          .warning(),
    }),
    defineField({ name: 'active', title: 'Active (shown on the site)', type: 'boolean', initialValue: true }),
  ],
  preview: {
    select: { title: 'name', role: 'role', language: 'language' },
    prepare: ({ title, role, language }: { title?: string; role?: string; language?: string }) => ({
      title: title || 'Specialist',
      subtitle: [role, langLabel(language)].filter(Boolean).join(' · '),
    }),
  },
});

export const testimonial = defineType({
  name: 'testimonial',
  title: 'Testimonial',
  type: 'document',
  description:
    'Customer quotes. Proof beats claims; keep them real and verifiable. One set per language/market: each market shows its own voices. To reuse one in another market, open it and add that language under Translations.',
  fields: [
    defineField({ name: 'language', type: 'string', readOnly: true, hidden: true }),
    defineField({ name: 'quote', title: 'Quote', type: 'text', rows: 4, validation: (r) => r.required() }),
    defineField({ name: 'name', title: 'Customer name', type: 'string', description: 'First name + initial is enough, e.g. Martin K.' }),
    defineField({ name: 'role', title: 'Trade + town', type: 'string', description: 'E.g. Carpenter, Aarhus.' }),
    defineField({
      name: 'productCode',
      title: 'Product (optional)',
      type: 'string',
      components: { input: SkuInput },
      description: 'If the quote is about a specific product, search for it here. The product page then shows it as a review, incl. to Google.',
    }),
    defineField({
      name: 'trades',
      title: 'Relevant trades',
      type: 'array',
      description: 'Tick the trades this quote suits; the quote then appears on those trade pages under /trades.',
      of: [defineArrayMember({ type: 'string' })],
      options: { list: TRADE_OPTIONS },
    }),
    defineField({ name: 'active', title: 'Active (shown on the site)', type: 'boolean', initialValue: true }),
  ],
  preview: {
    select: { title: 'name', quote: 'quote', language: 'language' },
    prepare: ({ title, quote, language }: { title?: string; quote?: string; language?: string }) => ({
      title: title || 'Testimonial',
      subtitle: [langLabel(language), quote].filter(Boolean).join(' · '),
    }),
  },
});

export const video = defineType({
  name: 'video',
  title: 'Film (YouTube)',
  type: 'document',
  description:
    'The partner films in the video sections. The first featured film is the big player. One set per language/market: each market shows its own films. To reuse one in another market, open it and add that language under Translations.',
  fields: [
    defineField({ name: 'language', type: 'string', readOnly: true, hidden: true }),
    defineField({
      name: 'youtubeId',
      title: 'YouTube video ID',
      type: 'string',
      description: 'The 11 characters after v= in the YouTube link, e.g. egSu462a-rI.',
      validation: (r) => r.required(),
    }),
    defineField({ name: 'title', title: 'Title', type: 'string' }),
    defineField({ name: 'by', title: 'By (partner/channel)', type: 'string', description: 'E.g. Lecot, Meesenburg.' }),
    defineField({ name: 'featured', title: 'Featured (the big player)', type: 'boolean', initialValue: false }),
    defineField({ name: 'active', title: 'Active (shown on the site)', type: 'boolean', initialValue: true }),
  ],
  preview: {
    select: { title: 'title', by: 'by', language: 'language' },
    prepare: ({ title, by, language }: { title?: string; by?: string; language?: string }) => ({
      title: title || 'Film',
      subtitle: [by, langLabel(language)].filter(Boolean).join(' · '),
    }),
  },
});

export const legalPage = defineType({
  name: 'legalPage',
  title: 'Legal page',
  type: 'document',
  description: 'Privacy, cookies, terms and the satisfaction guarantee. Plain formatted text, one document per page.',
  fields: [
    defineField({ name: 'language', type: 'string', readOnly: true, hidden: true }),
    defineField({ name: 'title', title: 'Page title', type: 'string', validation: (r) => r.required() }),
    defineField({
      name: 'slug',
      title: 'Which page',
      type: 'string',
      options: {
        list: [
          { title: 'Privacy policy (/privacy)', value: 'privacy' },
          { title: 'Cookie policy (/cookies)', value: 'cookies' },
          { title: 'Terms of sale (/terms)', value: 'terms' },
          { title: 'Satisfaction guarantee (/satisfaction-guarantee)', value: 'satisfaction-guarantee' },
        ],
        layout: 'radio',
      },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'body',
      title: 'Content',
      type: 'array',
      of: [defineArrayMember({ type: 'block' })],
    }),
  ],
  preview: {
    select: { title: 'title', slug: 'slug', language: 'language' },
    prepare: ({ title, slug, language }: { title?: string; slug?: string; language?: string }) => ({
      title: title || 'Legal page',
      subtitle: `/${slug || '…'} · ${langLabel(language)}`,
    }),
  },
});
