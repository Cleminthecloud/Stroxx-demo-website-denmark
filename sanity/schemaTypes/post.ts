import { defineArrayMember, defineField, defineType } from 'sanity';

/** News/blog articles at /nyheder. Formatted text with images; the index
 *  and article pages are code-owned, editors own the words. */

export const post = defineType({
  name: 'post',
  title: 'News article',
  type: 'document',
  description: 'News and stories at /nyheder. Newest first on the index.',
  fields: [
    defineField({ name: 'title', title: 'Headline', type: 'string', validation: (r) => r.required() }),
    defineField({
      name: 'slug',
      title: 'URL slug',
      type: 'slug',
      options: { source: 'title', maxLength: 80 },
      description: 'The address: /nyheder/this-part. Generate from the headline.',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'publishedAt',
      title: 'Publish date',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
      description: 'Controls the order on the index (newest first) and the date shown on the article.',
    }),
    defineField({
      name: 'heroImage',
      title: 'Hero image',
      type: 'image',
      options: { hotspot: true },
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt text',
          type: 'string',
          description: 'Describe the image for screen readers and image search, e.g. "Carpenter checking a laser level".',
        }),
      ],
    }),
    defineField({
      name: 'excerpt',
      title: 'Excerpt',
      type: 'text',
      rows: 3,
      description: 'One or two sentences for the index cards and search results.',
    }),
    defineField({
      name: 'body',
      title: 'Article',
      type: 'array',
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
    defineField({
      name: 'tags',
      title: 'Tags (filters on the news page)',
      type: 'array',
      of: [defineArrayMember({ type: 'string' })],
      options: { layout: 'tags' },
      description: 'Type a tag and press Enter. These become the filter chips on /nyheder. Suggested set: Carpentry, Electrical, Plumbing, Painting, Masonry, Tips, Specialist advice, Safety, Regulations, Tools. Reuse existing tags rather than inventing near-duplicates.',
    }),
    defineField({
      name: 'relatedSkus',
      title: 'Related products (SKUs)',
      type: 'array',
      of: [defineArrayMember({ type: 'string' })],
      description: 'Item numbers of products mentioned in the article; they show as cards under it ("Tools mentioned"). Unknown SKUs are skipped silently.',
    }),
    defineField({ name: 'seoTitle', title: 'SEO title', type: 'string' }),
    defineField({ name: 'seoDescription', title: 'SEO description', type: 'text', rows: 3 }),
    defineField({
      name: 'ogImage',
      title: 'Share image (social)',
      type: 'image',
      options: { hotspot: true },
      description: 'For LinkedIn/Facebook shares, 1200x630. Empty = the hero image, then the site-wide one.',
    }),
  ],
  orderings: [
    { title: 'Newest first', name: 'dateDesc', by: [{ field: 'publishedAt', direction: 'desc' }] },
  ],
  preview: { select: { title: 'title', subtitle: 'publishedAt', media: 'heroImage' } },
});
