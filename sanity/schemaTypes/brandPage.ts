import { defineArrayMember, defineField, defineType } from 'sanity';

/** The long-form brand guide at /brand (singleton). The page itself already
 *  carries the animated brand marks, the downloadable swatches/tokens and the
 *  hard rules (palette, type, glass, motion) in code; this document is the
 *  growing written guide on top, incl. the "STROXX the brand vs STROXX the
 *  dealer" teaching from the Brand Playbook. */
export const brandPage = defineType({
  name: 'brandPage',
  title: 'Brand guide (page)',
  type: 'document',
  fields: [
    defineField({
      name: 'intro',
      title: 'Intro',
      type: 'text',
      rows: 3,
      description: 'One or two lines under the page headline. Empty = the built-in intro.',
    }),
    defineField({
      name: 'body',
      title: 'The guide',
      type: 'array',
      description: 'Grow the written brand guide here: chapters, principles, do/don\'t, the brand-vs-dealer teaching. Headings become the structure.',
      of: [
        defineArrayMember({ type: 'block' }),
        defineArrayMember({
          type: 'image',
          options: { hotspot: true },
          fields: [
            defineField({ name: 'alt', title: 'Alt text', type: 'string' }),
            defineField({ name: 'caption', title: 'Caption', type: 'string' }),
          ],
        }),
      ],
    }),
  ],
  preview: { prepare: () => ({ title: 'Brand guide (page)' }) },
});
