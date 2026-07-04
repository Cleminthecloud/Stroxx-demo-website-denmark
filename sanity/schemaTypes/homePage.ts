import { defineArrayMember, defineField, defineType } from 'sanity';

const accentNote = 'Wrap a word in *asterisks* for the blue accent. Line breaks are respected.';
const t = (name: string, title: string, rows = 2) =>
  defineField({ name, title, type: 'text', rows, description: rows <= 2 ? accentNote : undefined });
const s = (name: string, title: string) => defineField({ name, title, type: 'string' });

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
  fields: [
    defineField({
      ...t('heroHeadline', 'Hero headline', 3),
      description:
        'The giant front-page headline. Press Enter where the line should break; each line animates in separately. Wrap a word in *asterisks* for the blue accent.',
      group: 'hero',
    }),
    defineField({ ...t('claim', 'Claim headline'), description: accentNote + ' The accented part renders blue.', group: 'hero' }),
    defineField({ ...t('claimSub', 'Claim subtext', 4), group: 'hero' }),
    defineField({
      ...s('marqueeText', 'Marquee text'),
      description: 'The scrolling band. Wrap a word in *asterisks* for the blue accent.',
      group: 'hero',
    }),

    defineField({ ...t('rangeHeadline', 'Range headline', 3), group: 'range' }),
    defineField({ ...s('rangeCol1Label', 'Range column 1 label'), group: 'range' }),
    defineField({ ...t('rangeCol1Text', 'Range column 1 text', 4), group: 'range' }),
    defineField({ ...s('rangeCol2Label', 'Range column 2 label'), group: 'range' }),
    defineField({ ...t('rangeCol2Text', 'Range column 2 text', 4), group: 'range' }),
    defineField({ ...t('scaleHeadline', 'Scale headline', 3), group: 'range' }),
    defineField({ ...s('scaleCol1Label', 'Scale column 1 label'), group: 'range' }),
    defineField({ ...t('scaleCol1Text', 'Scale column 1 text', 4), group: 'range' }),
    defineField({ ...s('scaleCol2Label', 'Scale column 2 label'), group: 'range' }),
    defineField({ ...t('scaleCol2Text', 'Scale column 2 text', 4), group: 'range' }),
    defineField({
      name: 'stats',
      title: 'Stats band',
      group: 'range',
      type: 'array',
      validation: (r) => r.max(3),
      of: [
        defineArrayMember({
          type: 'object',
          name: 'stat',
          fields: [
            defineField({ name: 'value', title: 'Number', type: 'number' }),
            defineField({ name: 'suffix', title: 'Suffix', type: 'string' }),
            defineField({ name: 'label', title: 'Label', type: 'string' }),
          ],
          preview: { select: { title: 'label' } },
        }),
      ],
    }),

    defineField({ ...s('specialistsHeadline', 'Specialists headline'), description: accentNote, group: 'proof' }),
    defineField({ ...t('guaranteeHeadline', 'Guarantee headline'), group: 'proof' }),
    defineField({ ...t('guaranteeText', 'Guarantee text', 4), group: 'proof' }),

    defineField({ ...t('monthHeadline', 'Month section headline'), description: accentNote + ' The accented part renders blue.', group: 'month' }),
    defineField({ ...t('monthText', 'Month section text', 4), group: 'month' }),
    defineField({ ...t('categoriesHeadline', 'Categories headline'), group: 'month' }),
    defineField({ ...s('ctaLabel', 'Final CTA button label'), group: 'month' }),
    defineField({
      name: 'campaignImages',
      title: 'Campaign band photos (3 recommended)',
      description: 'The cinematic cross-fading photo series on the homepage. Leave empty for the built-in campaign shots.',
      type: 'array',
      group: 'month',
      validation: (r) => r.max(4),
      of: [{ type: 'image', options: { hotspot: true } }],
    }),
  ],
  preview: { prepare: () => ({ title: 'Homepage' }) },
});
