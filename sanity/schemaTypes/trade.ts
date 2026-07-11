import { defineArrayMember, defineField, defineType } from 'sanity';
import { langLabel } from '../lib/langLabel';

/** Trade landing pages: /trades lists them as cards, /trades/<slug> is the
 *  full page. Hardcoded fallbacks live in lib/trades.ts, so an empty
 *  collection never blanks the pages. Products are pulled automatically from
 *  the chosen categories (PIM does the rest); testimonials tagged with the
 *  trade slug appear on the page by themselves. */

/** Keep in sync with the category slugs in lib/data.ts. Also used by the
 *  specialist quote-topic picker in collections.ts. */
export const CATEGORY_OPTIONS = [
  { title: 'Access control', value: 'access-control' },
  { title: 'Workwear', value: 'workwear' },
  { title: 'Batteries', value: 'batteries' },
  { title: 'Lighting and accessories', value: 'lighting' },
  { title: 'Bits and screwdrivers', value: 'bits-screwdrivers' },
  { title: 'Drills and drill sets', value: 'drill-bits' },
  { title: 'Sealant and accessories', value: 'sealant' },
  { title: 'Hole saws and accessories', value: 'hole-saws' },
  { title: 'Cable reels', value: 'cable-reels' },
  { title: 'Chemicals and paint tools', value: 'chemicals' },
  { title: 'Knives and blades', value: 'knives' },
  { title: 'Lasers and accessories', value: 'lasers' },
  { title: 'Painting gear and accessories', value: 'painting-tools' },
  { title: 'Multi-cutter blades', value: 'multi-cutter-blades' },
  { title: 'Measuring tools', value: 'measuring-tools' },
  { title: 'Circular saw blades', value: 'circular-saw-blades' },
  { title: 'Safety', value: 'safety' },
  { title: 'Site hut supplies', value: 'site-hut-supplies' },
  { title: 'Tape', value: 'tape' },
  { title: 'Socket sets, sockets and accessories', value: 'socket-sets' },
];

export const trade = defineType({
  name: 'trade',
  title: 'Trade page',
  type: 'document',
  description: 'A trade area: card on /trades plus its own page at /trades/<slug>.',
  fields: [
    defineField({ name: 'language', type: 'string', readOnly: true, hidden: true }),
    defineField({
      name: 'name',
      title: 'Trade name',
      type: 'string',
      description: 'Shown on the card and in menus, e.g. Electrician.',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug (the address: /trades/<slug>)',
      type: 'slug',
      options: { source: 'name' },
      description:
        'Lowercase, no spaces. Testimonials tagged with this slug appear on the page. Changing it changes the address.',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'title',
      title: 'Page headline',
      type: 'string',
      description: 'The big h1 on the trade page, e.g. "Power on the job. Every day."',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'accent',
      title: 'Blue part of the headline',
      type: 'string',
      description:
        'The exact ending of the headline rendered in STROXX blue. Must match the headline text exactly, e.g. "Every day."',
      validation: (r) =>
        r
          .custom((accent, context) => {
            const headline = (context.document as { title?: string } | undefined)?.title;
            if (!accent || !headline) return true;
            return headline.trimEnd().endsWith(String(accent).trim())
              ? true
              : 'The headline does not end with this text, so the blue accent will not show. Copy the exact ending of the headline.';
          })
          .warning(),
    }),
    defineField({
      name: 'blurb',
      title: 'Blurb',
      type: 'text',
      rows: 3,
      description: 'One or two sentences under the headline and on the /trades card. Name the job, sell the outcome, no hype.',
    }),
    defineField({
      name: 'categories',
      title: 'Product categories',
      type: 'array',
      of: [defineArrayMember({ type: 'string' })],
      options: { list: CATEGORY_OPTIONS },
      description:
        'The categories this trade buys from. The card shows the top 3 products, the page shows the top 8, picked automatically.',
      validation: (r) => r.min(1),
    }),
    defineField({
      name: 'faq',
      title: 'Trade FAQ',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({ name: 'q', title: 'Question', type: 'string', validation: (r) => r.required() }),
            defineField({ name: 'a', title: 'Answer', type: 'text', rows: 3, validation: (r) => r.required() }),
          ],
          preview: { select: { title: 'q' } },
        }),
      ],
      description: 'Shown as an accordion and sent to Google as FAQ data. 2-4 questions is the sweet spot.',
    }),
    defineField({
      name: 'order',
      title: 'Sort order',
      type: 'number',
      description: 'Lower numbers first on /trades. 10, 20, 30... leaves room to squeeze one in later.',
      initialValue: 50,
    }),
    defineField({ name: 'active', title: 'Active (shown on the site)', type: 'boolean', initialValue: true }),
  ],
  orderings: [
    { title: 'Sort order', name: 'orderAsc', by: [{ field: 'order', direction: 'asc' }] },
  ],
  preview: {
    select: { title: 'name', slug: 'slug.current', language: 'language' },
    prepare: ({ title, slug, language }: { title?: string; slug?: string; language?: string }) => ({
      title: title || 'Trade',
      subtitle: `/trades/${slug || '…'} · ${langLabel(language)}`,
    }),
  },
});
