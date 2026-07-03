import { defineArrayMember, defineField, defineType } from 'sanity';

/** Campaign landing pages assembled from a fixed menu of section blocks, the
 *  /proev-det structure as reusable, reorderable types. Headline fields
 *  support the site's `*word*` blue-accent syntax and `\n` line breaks
 *  (ScrollText parses both).
 *
 *  Products are referenced by SKU (item code) and joined against the product
 *  feed at render, the CMS never becomes a product database. */

const accentNote = 'Wrap a word in *asterisks* for the blue accent. Use \\n for a line break.';

const eyebrow = defineField({ name: 'eyebrow', title: 'Eyebrow label', type: 'string' });
const headline = defineField({ name: 'headline', title: 'Headline', type: 'text', rows: 2, description: accentNote });

export const landingPage = defineType({
  name: 'landingPage',
  title: 'Landing page',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Internal title', type: 'string', validation: (r) => r.required() }),
    defineField({
      name: 'slug',
      title: 'URL slug',
      type: 'slug',
      options: { source: 'title' },
      validation: (r) => r.required(),
    }),
    defineField({ name: 'seoTitle', title: 'SEO title', type: 'string' }),
    defineField({ name: 'seoDescription', title: 'SEO description', type: 'text', rows: 3 }),
    defineField({
      name: 'sections',
      title: 'Sections',
      type: 'array',
      of: [
        defineArrayMember({
          name: 'photoHero',
          title: 'Photo hero',
          type: 'object',
          fields: [
            eyebrow,
            headline,
            defineField({ name: 'sub', title: 'Subline', type: 'text', rows: 3, description: accentNote }),
            defineField({ name: 'ctaLabel', title: 'Primary button label', type: 'string' }),
            defineField({ name: 'secondaryLabel', title: 'Secondary link label', type: 'string' }),
            defineField({
              name: 'image',
              title: 'Background image path',
              type: 'string',
              description: 'Path under /public, e.g. /Images/campaign/rings.jpg',
              initialValue: '/Images/campaign/rings.jpg',
            }),
          ],
          preview: { select: { title: 'headline' }, prepare: (s) => ({ title: `Hero · ${s.title || ''}` }) },
        }),
        defineArrayMember({
          name: 'statement',
          title: 'Statement',
          type: 'object',
          fields: [
            eyebrow,
            headline,
            defineField({
              name: 'paragraphs',
              title: 'Paragraphs',
              type: 'array',
              of: [defineArrayMember({ type: 'text', rows: 4 })],
            }),
            defineField({
              name: 'align',
              title: 'Alignment',
              type: 'string',
              options: { list: ['left', 'right'], layout: 'radio' },
              initialValue: 'left',
            }),
          ],
          preview: { select: { title: 'headline' }, prepare: (s) => ({ title: `Statement · ${s.title || ''}` }) },
        }),
        defineArrayMember({
          name: 'reframe',
          title: 'Statement + stats',
          type: 'object',
          fields: [
            eyebrow,
            headline,
            defineField({
              name: 'paragraphs',
              title: 'Paragraphs',
              type: 'array',
              of: [defineArrayMember({ type: 'text', rows: 4 })],
            }),
            defineField({
              name: 'stats',
              title: 'Stats',
              type: 'array',
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
          ],
          preview: { select: { title: 'headline' }, prepare: (s) => ({ title: `Stats · ${s.title || ''}` }) },
        }),
        defineArrayMember({
          name: 'productProof',
          title: 'Product proof',
          type: 'object',
          fields: [
            eyebrow,
            headline,
            defineField({ name: 'sub', title: 'Subline', type: 'text', rows: 3 }),
            defineField({
              name: 'skus',
              title: 'Product SKUs',
              description: 'Carl Ras item numbers, joined against the product feed at render.',
              type: 'array',
              of: [defineArrayMember({ type: 'string' })],
            }),
          ],
          preview: { select: { title: 'headline' }, prepare: (s) => ({ title: `Products · ${s.title || ''}` }) },
        }),
        defineArrayMember({
          name: 'videoProof',
          title: 'Video proof',
          type: 'object',
          fields: [eyebrow, headline, defineField({ name: 'sub', title: 'Subline', type: 'text', rows: 3 })],
          preview: { select: { title: 'headline' }, prepare: (s) => ({ title: `Video · ${s.title || ''}` }) },
        }),
        defineArrayMember({
          name: 'testimonialProof',
          title: 'Testimonials',
          type: 'object',
          fields: [eyebrow, headline],
          preview: { select: { title: 'headline' }, prepare: (s) => ({ title: `Testimonials · ${s.title || ''}` }) },
        }),
        defineArrayMember({
          name: 'photoBreak',
          title: 'Photo break',
          type: 'object',
          fields: [
            eyebrow,
            headline,
            defineField({ name: 'sub', title: 'Subline', type: 'text', rows: 3 }),
            defineField({
              name: 'image',
              title: 'Background image path',
              type: 'string',
              initialValue: '/Images/campaign/tea.jpg',
            }),
          ],
          preview: { select: { title: 'headline' }, prepare: (s) => ({ title: `Photo · ${s.title || ''}` }) },
        }),
        defineArrayMember({
          name: 'guaranteeAsk',
          title: 'Guarantee + steps',
          type: 'object',
          fields: [
            eyebrow,
            headline,
            defineField({ name: 'sub', title: 'Subline', type: 'text', rows: 3 }),
            defineField({
              name: 'steps',
              title: 'Steps',
              type: 'array',
              of: [
                defineArrayMember({
                  type: 'object',
                  name: 'step',
                  fields: [
                    defineField({ name: 'title', title: 'Title', type: 'string' }),
                    defineField({ name: 'body', title: 'Body', type: 'text', rows: 3 }),
                  ],
                  preview: { select: { title: 'title' } },
                }),
              ],
            }),
            defineField({ name: 'ctaLabel', title: 'Primary button label', type: 'string' }),
            defineField({ name: 'secondaryLabel', title: 'Secondary button label', type: 'string' }),
          ],
          preview: { select: { title: 'headline' }, prepare: (s) => ({ title: `Guarantee · ${s.title || ''}` }) },
        }),
        defineArrayMember({
          name: 'faqSection',
          title: 'FAQ',
          type: 'object',
          fields: [
            eyebrow,
            headline,
            defineField({
              name: 'items',
              title: 'Questions',
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
          ],
          preview: { select: { title: 'headline' }, prepare: (s) => ({ title: `FAQ · ${s.title || ''}` }) },
        }),
      ],
    }),
  ],
  preview: { select: { title: 'title', subtitle: 'slug.current' } },
});
