import { defineArrayMember, defineField, defineType } from 'sanity';
import SkuInput from '../SkuInput';
import SkuListInput from '../SkuListInput';
import FilmPicker from '../FilmPicker';
import { skuLabel } from '../lib/skuOptions';
import { langLabel } from '../lib/langLabel';

/** Månedens STROXX, the SKA monthly engine (docs/STROXX KOMMERCIEL MOTOR.pdf):
 *  1 hero, 5 DB2 winners, 1-3 news items. Products are referenced by SKU and
 *  joined against the product feed at render (lib/cms.ts getSka), unknown SKUs
 *  are dropped with the hardcoded lineup as fallback. The live lineup is the
 *  latest one whose "Active from" date has passed (lib/cms.ts getSka). */
export const monthlyLineup = defineType({
  name: 'monthlyLineup',
  title: 'Monthly lineup (Månedens STROXX)',
  type: 'document',
  fieldsets: [
    { name: 'timing', title: 'When it goes live', options: { collapsible: true, collapsed: false } },
    { name: 'hero', title: 'Hero of the month', options: { collapsible: true, collapsed: false } },
    { name: 'winners', title: 'The five winners (Månedens fem)', options: { collapsible: true, collapsed: false } },
    { name: 'extras', title: 'News + films', options: { collapsible: true, collapsed: false } },
  ],
  fields: [
    defineField({ name: 'language', type: 'string', readOnly: true, hidden: true }),
    defineField({
      name: 'month',
      title: 'Month',
      type: 'string',
      fieldset: 'timing',
      description: 'The month name exactly as it should read on the page, in this language, e.g. Juli.',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'year',
      title: 'Year',
      type: 'string',
      fieldset: 'timing',
      description: 'Four digits, e.g. 2026.',
      validation: (r) => r.required().regex(/^20\d\d$/, { name: 'year' }).error('Four digits, e.g. 2026'),
    }),
    defineField({
      name: 'activeFrom',
      title: 'Active from',
      type: 'date',
      fieldset: 'timing',
      description:
        'The date this lineup goes live. The site always shows the most recent lineup whose date has passed, so you can build next month ahead of time and it takes over on the day. Empty = falls back to whichever lineup was created last.',
      options: { dateFormat: 'YYYY-MM-DD' },
    }),
    defineField({
      name: 'heroSku',
      title: 'Hero product',
      type: 'string',
      fieldset: 'hero',
      components: { input: SkuInput },
      description: 'The month’s main story. Search by product name or item number.',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'heroClaims',
      title: 'Hero claims',
      type: 'array',
      fieldset: 'hero',
      description: 'The row balances itself at any count; 3 claims is the classic.',
      validation: (r) => r.max(6),
      of: [
        defineArrayMember({
          type: 'object',
          name: 'claim',
          fields: [
            defineField({ name: 'title', title: 'Title', type: 'string' }),
            defineField({ name: 'body', title: 'Body', type: 'text', rows: 3 }),
          ],
          preview: { select: { title: 'title' } },
        }),
      ],
    }),
    defineField({
      name: 'heroCases',
      title: 'Hero use cases',
      type: 'array',
      fieldset: 'hero',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'case',
          fields: [
            defineField({ name: 'trade', title: 'Trade', type: 'string' }),
            defineField({ name: 'use', title: 'Use', type: 'text', rows: 3 }),
          ],
          preview: { select: { title: 'trade' } },
        }),
      ],
    }),
    defineField({
      name: 'heroFaq',
      title: 'Hero FAQ',
      type: 'array',
      fieldset: 'hero',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'faqItem',
          fields: [
            defineField({ name: 'q', title: 'Question', type: 'string' }),
            defineField({ name: 'a', title: 'Answer', type: 'text', rows: 4 }),
          ],
          preview: { select: { title: 'q' } },
        }),
      ],
    }),
    defineField({
      name: 'cashCowSkus',
      title: 'The five winners',
      description: 'Månedens fem, the five volume winners of the month. Search and add; drag order is the display order.',
      type: 'array',
      fieldset: 'winners',
      of: [defineArrayMember({ type: 'string' })],
      components: { input: SkuListInput },
      validation: (r) => r.max(5),
    }),
    defineField({
      name: 'news',
      title: 'News items',
      type: 'array',
      fieldset: 'extras',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'newsItem',
          fields: [
            defineField({ name: 'label', title: 'Type label', type: 'string', description: 'E.g. Premium new arrival, Problem solver.' }),
            defineField({ name: 'sku', title: 'Product', type: 'string', components: { input: SkuInput }, description: 'Search by product name or item number.' }),
            defineField({ name: 'pitch', title: 'Pitch', type: 'text', rows: 2 }),
          ],
          preview: {
            select: { label: 'label', sku: 'sku' },
            prepare: ({ label, sku }: { label?: string; sku?: string }) => ({
              title: label || 'News item',
              subtitle: sku ? skuLabel(sku) : 'No product selected',
            }),
          },
        }),
      ],
      validation: (r) => r.max(3),
    }),
    defineField({
      name: 'films',
      title: 'Films',
      type: 'array',
      fieldset: 'extras',
      of: [defineArrayMember({ type: 'reference', to: [{ type: 'video' }] })],
      components: { input: FilmPicker },
      description:
        'Pick the films for this month’s film section, in order. Paste a YouTube link to add a new one on the fly. Leave empty to show all active films.',
    }),
  ],
  preview: {
    select: { month: 'month', year: 'year', language: 'language' },
    prepare: (s: { month?: string; year?: string; language?: string }) => ({
      title: `Månedens STROXX · ${s.month || ''} ${s.year || ''}`,
      subtitle: langLabel(s.language),
    }),
  },
});
