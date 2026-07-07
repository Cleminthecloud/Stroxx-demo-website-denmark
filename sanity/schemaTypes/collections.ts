import { defineArrayMember, defineField, defineType } from 'sanity';
import SkuInput from '../SkuInput';

/** The people, voices, films and legal texts of the site, each a small
 *  collection editors own. All have hardcoded fallbacks in code, so an empty
 *  collection never blanks a page. */

export const specialist = defineType({
  name: 'specialist',
  title: 'Specialist',
  type: 'document',
  description: 'The trade specialists shown on the homepage cards and product pages.',
  fields: [
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
      title: 'Quote topic (category slug)',
      type: 'string',
      description:
        'IMPORTANT: if the quote names a product or category, put that category slug here (e.g. lasere) so it only shows on matching products. Leave empty for brand-generic quotes that are safe anywhere.',
    }),
    defineField({
      name: 'consentGiven',
      title: 'Consent given (photo + direct contact on the web)',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({ name: 'active', title: 'Active (shown on the site)', type: 'boolean', initialValue: true }),
  ],
  preview: { select: { title: 'name', subtitle: 'role' } },
});

export const testimonial = defineType({
  name: 'testimonial',
  title: 'Testimonial',
  type: 'document',
  description: 'Customer quotes. Proof beats claims; keep them real and verifiable.',
  fields: [
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
      description: 'Trade slugs this quote suits (toemrer, elektriker, vvs, murer, maler). Controls which trade pages show it.',
      of: [defineArrayMember({ type: 'string' })],
    }),
    defineField({ name: 'active', title: 'Active (shown on the site)', type: 'boolean', initialValue: true }),
  ],
  preview: { select: { title: 'name', subtitle: 'quote' } },
});

export const video = defineType({
  name: 'video',
  title: 'Film (YouTube)',
  type: 'document',
  description: 'The partner films in the video sections. The first featured film is the big player.',
  fields: [
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
  preview: { select: { title: 'title', subtitle: 'by' } },
});

export const legalPage = defineType({
  name: 'legalPage',
  title: 'Legal page',
  type: 'document',
  description: 'Privacy, cookies and terms. Plain formatted text, one document per page.',
  fields: [
    defineField({ name: 'title', title: 'Page title', type: 'string', validation: (r) => r.required() }),
    defineField({
      name: 'slug',
      title: 'Which page',
      type: 'string',
      options: {
        list: [
          { title: 'Privacy policy (/privatliv)', value: 'privatliv' },
          { title: 'Cookie policy (/cookies)', value: 'cookies' },
          { title: 'Terms of sale (/handelsbetingelser)', value: 'handelsbetingelser' },
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
  preview: { select: { title: 'title', subtitle: 'slug' } },
});
