import { defineArrayMember, defineField, defineType } from 'sanity';

/** Månedens STROXX, the SKA monthly engine (docs/STROXX KOMMERCIEL MOTOR.pdf):
 *  1 hero, 5 DB2 winners, 1-3 news items. Products are referenced by SKU and
 *  joined against the product feed at render (lib/cms.ts getSka), unknown SKUs
 *  are dropped with the hardcoded lineup as fallback. */
export const monthlyLineup = defineType({
  name: 'monthlyLineup',
  title: 'Monthly lineup (Månedens STROXX)',
  type: 'document',
  fields: [
    defineField({ name: 'month', title: 'Month', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'year', title: 'Year', type: 'string', validation: (r) => r.required() }),
    defineField({
      name: 'heroSku',
      title: 'Hero product SKU',
      type: 'string',
      description: 'The month’s main story. Item number (SKU) from the product range.',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'heroClaims',
      title: 'Hero claims',
      type: 'array',
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
      title: 'The five winners (SKUs)',
      description: 'Månedens fem, volume products at sharp prices.',
      type: 'array',
      of: [defineArrayMember({ type: 'string' })],
      validation: (r) => r.max(5),
    }),
    defineField({
      name: 'news',
      title: 'News items',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'newsItem',
          fields: [
            defineField({ name: 'label', title: 'Type label', type: 'string', description: 'E.g. Premium new arrival, Problem solver.' }),
            defineField({ name: 'sku', title: 'Product SKU', type: 'string' }),
            defineField({ name: 'pitch', title: 'Pitch', type: 'text', rows: 2 }),
          ],
          preview: { select: { title: 'label', subtitle: 'sku' } },
        }),
      ],
      validation: (r) => r.max(3),
    }),
  ],
  preview: {
    select: { month: 'month', year: 'year' },
    prepare: (s) => ({ title: `Månedens STROXX · ${s.month || ''} ${s.year || ''}` }),
  },
});
