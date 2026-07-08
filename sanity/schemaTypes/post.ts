import { defineArrayMember, defineField, defineType } from 'sanity';
import SharePreviewField from '../SharePreviewField';
import SkuListInput from '../SkuListInput';

/** News/blog articles at /nyheder. Formatted text with images; the index
 *  and article pages are code-owned, editors own the words. */

export const post = defineType({
  name: 'post',
  title: 'News article',
  type: 'document',
  description: 'News and stories at /nyheder. Newest first on the index.',
  fields: [
    defineField({ name: 'language', type: 'string', readOnly: true, hidden: true }),
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
        defineArrayMember({
          type: 'object',
          name: 'productSlider',
          title: 'Product slider',
          description: 'A horizontal row of product cards inside the article. Type item numbers; name, photo and buy link come from the product feed automatically. All of them show: the row scrolls and gets arrows, 3-8 products read best.',
          fields: [
            defineField({ name: 'title', title: 'Small heading above (optional)', type: 'string' }),
            defineField({
              name: 'skus',
              title: 'Products (3-8 work best)',
              type: 'array',
              of: [defineArrayMember({ type: 'string' })],
              components: { input: SkuListInput },
            }),
          ],
          preview: {
            select: { title: 'title', skus: 'skus' },
            prepare: (v: { title?: string; skus?: string[] }) => ({
              title: `Product slider · ${v.title || (v.skus || []).length + ' products'}`,
            }),
          },
        }),
      ],
    }),
    defineField({
      name: 'tags',
      title: 'Tags (filters on the news page)',
      type: 'array',
      of: [defineArrayMember({ type: 'string' })],
      options: { layout: 'tags' },
      description: 'Type a tag and press Enter. These become the filter chips on /nyheder. Use the brand handles where they fit: Quality proof (premium credibility stories), Professional favorites (what pros actually rebuy), New solutions (new products and methods), plus trades and topics: Carpentry, Electrical, Plumbing, Painting, Masonry, Tips, Specialist advice, Safety, Regulations, Tools. Reuse existing tags rather than inventing near-duplicates.',
    }),
    defineField({
      name: 'relatedSkus',
      title: 'Related products',
      type: 'array',
      of: [defineArrayMember({ type: 'string' })],
      components: { input: SkuListInput },
      description: 'Products mentioned in the article. THE RULE: the first 4 show as a card row under the article ("Tools mentioned"), so order them most-relevant first (use the ↑ ↓ buttons). Unknown item numbers are skipped silently.',
    }),
    defineField({ name: 'seoTitle', title: 'SEO title', type: 'string', description: 'The title Google and share cards show. Under 60 characters. Empty = the headline.' }),
    defineField({ name: 'seoDescription', title: 'SEO description', type: 'text', rows: 3, description: 'The snippet under the title in Google. Under 155 characters. Empty = the excerpt.' }),
    defineField({
      name: 'ogImage',
      title: 'Share image (social)',
      type: 'image',
      options: { hotspot: true },
      description: 'For LinkedIn/Facebook shares, 1200x630. Empty = the hero image, then the site-wide one.',
    }),
    defineField({
      name: 'sharePreview',
      title: 'Share preview (live)',
      type: 'string',
      readOnly: true,
      components: { input: SharePreviewField },
      description: 'How this article looks when the link is shared, built from the fields above as you type. Nothing to fill in here.',
    }),
  ],
  orderings: [
    { title: 'Newest first', name: 'dateDesc', by: [{ field: 'publishedAt', direction: 'desc' }] },
  ],
  preview: { select: { title: 'title', subtitle: 'publishedAt', media: 'heroImage' } },
});
