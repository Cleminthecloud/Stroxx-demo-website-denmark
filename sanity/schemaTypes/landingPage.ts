import { defineArrayMember, defineField, defineType } from 'sanity';

/** Campaign landing pages assembled from a fixed menu of section blocks.
 *  Every block title reads like what it does; a live preview of every block
 *  with sample content is at /komponenter on the site.
 *
 *  Products are referenced by SKU (item code) and joined against the product
 *  feed at render, the CMS never becomes a product database. */

const accentNote = 'Wrap a word in *asterisks* for the blue accent. Press Enter for a line break.';

const eyebrow = defineField({
  name: 'eyebrow',
  title: 'Eyebrow label',
  description: 'The small uppercase label above the headline. Optional.',
  type: 'string',
});
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
      description:
        'Becomes the address: slug "sommer" publishes at /kampagne/sommer. Use / to nest: "sommer/tilbud" publishes at /kampagne/sommer/tilbud. Moving a page = editing its slug (the old address stops working, so set up a redirect if it was shared).',
      type: 'slug',
      options: {
        source: 'title',
        slugify: (input: string) =>
          input.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9/-]/g, '').replace(/-+/g, '-').slice(0, 96),
      },
      validation: (r) =>
        r.required().custom((s: { current?: string } | undefined) =>
          !s?.current || /^[a-z0-9-]+(\/[a-z0-9-]+)*$/.test(s.current)
            ? true
            : 'Lowercase letters, numbers and dashes; use / to nest under a parent'
        ),
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
          title: 'Hero: full-screen photo or video',
          type: 'object',
          description: 'Full-bleed opener with a photo or looping video behind the headline. Choose text position and height.',
          fields: [
            eyebrow,
            headline,
            defineField({ name: 'sub', title: 'Subline', type: 'text', rows: 3, description: accentNote }),
            defineField({ name: 'ctaLabel', title: 'Primary button label', type: 'string' }),
            defineField({ name: 'secondaryLabel', title: 'Secondary link label', type: 'string' }),
            defineField({
              name: 'imageUpload',
              title: 'Image (upload or pick from media library)',
              type: 'image',
              options: { hotspot: true },
              description: 'Preferred. Overrides the image path below when set.',
            }),
            defineField({
              name: 'image',
              title: 'Background image path (fallback)',
              type: 'string',
              description: 'Path under /public, e.g. /Images/campaign/rings.jpg. Used when no image is uploaded. Ignored when a video is set.',
              initialValue: '/Images/campaign/rings.jpg',
            }),
            defineField({
              name: 'videoUrl',
              title: 'Background video URL (optional)',
              type: 'string',
              description: 'Direct .mp4 link. Plays muted on loop behind the text; the image is used as fallback/poster.',
            }),
            defineField({
              name: 'align',
              title: 'Text position',
              type: 'string',
              options: { list: ['left', 'center', 'right'], layout: 'radio', direction: 'horizontal' },
              initialValue: 'left',
            }),
            defineField({
              name: 'height',
              title: 'Section height',
              type: 'string',
              options: {
                list: [
                  { title: 'Full screen', value: 'full' },
                  { title: 'Tall (80%)', value: 'tall' },
                  { title: 'Half', value: 'half' },
                ],
                layout: 'radio',
                direction: 'horizontal',
              },
              initialValue: 'full',
            }),
          ],
          preview: { select: { title: 'headline' }, prepare: (s) => ({ title: `Hero · ${s.title || ''}` }) },
        }),
        defineArrayMember({
          name: 'statement',
          title: 'Big statement (huge headline + paragraphs)',
          type: 'object',
          description: 'The signature typographic section: giant scroll-animated headline with supporting paragraphs. The last paragraph renders white for emphasis.',
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
              options: { list: ['left', 'right'], layout: 'radio', direction: 'horizontal' },
              initialValue: 'left',
            }),
          ],
          preview: { select: { title: 'headline' }, prepare: (s) => ({ title: `Statement · ${s.title || ''}` }) },
        }),
        defineArrayMember({
          name: 'reframe',
          title: 'Headline + animated number stats',
          type: 'object',
          description: 'Two columns: headline and paragraphs on the left, big counting-up numbers on the right.',
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
                    defineField({ name: 'suffix', title: 'Suffix', type: 'string', description: 'E.g. + or %.' }),
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
          name: 'splitMedia',
          title: 'Image + text, side by side',
          type: 'object',
          description: 'Classic 50/50 split: an image on one side, headline + text + optional button on the other. Choose which side the image sits on.',
          fields: [
            eyebrow,
            headline,
            defineField({ name: 'body', title: 'Text', type: 'text', rows: 5 }),
            defineField({ name: 'ctaLabel', title: 'Button label (optional)', type: 'string' }),
            defineField({
              name: 'ctaHref',
              title: 'Button link',
              type: 'string',
              description: 'Internal path (/produkter) or full URL. Defaults to the Carl Ras shop.',
            }),
            defineField({
              name: 'imageUpload',
              title: 'Image (upload or pick from media library)',
              type: 'image',
              options: { hotspot: true },
              description: 'Preferred. Overrides the image path below when set.',
            }),
            defineField({
              name: 'image',
              title: 'Image path (fallback)',
              type: 'string',
              description: 'Path under /public, used when no image is uploaded.',
            }),
            defineField({
              name: 'imageSide',
              title: 'Image side',
              type: 'string',
              options: { list: ['left', 'right'], layout: 'radio', direction: 'horizontal' },
              initialValue: 'right',
            }),
          ],
          preview: { select: { title: 'headline' }, prepare: (s) => ({ title: `Split · ${s.title || ''}` }) },
        }),
        defineArrayMember({
          name: 'featureGrid',
          title: 'Feature cards (3-up glass grid)',
          type: 'object',
          description: 'A row of frosted-glass cards, each with a title and short text. Good for USPs, benefits, service promises.',
          fields: [
            eyebrow,
            headline,
            defineField({
              name: 'items',
              title: 'Cards',
              type: 'array',
              validation: (r) => r.max(6),
              of: [
                defineArrayMember({
                  type: 'object',
                  name: 'feature',
                  fields: [
                    defineField({ name: 'title', title: 'Card title', type: 'string' }),
                    defineField({ name: 'body', title: 'Card text', type: 'text', rows: 3 }),
                  ],
                  preview: { select: { title: 'title' } },
                }),
              ],
            }),
          ],
          preview: { select: { title: 'headline' }, prepare: (s) => ({ title: `Features · ${s.title || ''}` }) },
        }),
        defineArrayMember({
          name: 'productProof',
          title: 'Product cards (by SKU)',
          type: 'object',
          description: 'A grid of live product cards. Enter Carl Ras item numbers; name, photo and price data come from the product feed.',
          fields: [
            eyebrow,
            headline,
            defineField({ name: 'sub', title: 'Subline', type: 'text', rows: 3 }),
            defineField({
              name: 'skus',
              title: 'Product SKUs',
              description: 'Carl Ras item numbers, e.g. 34011573. Unknown numbers are skipped.',
              type: 'array',
              of: [defineArrayMember({ type: 'string' })],
            }),
          ],
          preview: { select: { title: 'headline' }, prepare: (s) => ({ title: `Products · ${s.title || ''}` }) },
        }),
        defineArrayMember({
          name: 'videoProof',
          title: 'Video gallery (partner films)',
          type: 'object',
          description: 'The film section: partner YouTube videos in a lightweight player.',
          fields: [eyebrow, headline, defineField({ name: 'sub', title: 'Subline', type: 'text', rows: 3 })],
          preview: { select: { title: 'headline' }, prepare: (s) => ({ title: `Video · ${s.title || ''}` }) },
        }),
        defineArrayMember({
          name: 'quote',
          title: 'Pull quote (one big citation)',
          type: 'object',
          description: 'One large quote with attribution. Stronger than a testimonial grid when you have a single killer line.',
          fields: [
            defineField({ name: 'text', title: 'Quote', type: 'text', rows: 3 }),
            defineField({ name: 'attribution', title: 'Name', type: 'string' }),
            defineField({ name: 'role', title: 'Role / company', type: 'string' }),
          ],
          preview: { select: { title: 'text' }, prepare: (s) => ({ title: `Quote · ${(s.title || '').slice(0, 40)}` }) },
        }),
        defineArrayMember({
          name: 'testimonialProof',
          title: 'Testimonials (customer quotes grid)',
          type: 'object',
          description: 'The curated customer testimonial cards. Content comes from the testimonial collection.',
          fields: [eyebrow, headline],
          preview: { select: { title: 'headline' }, prepare: (s) => ({ title: `Testimonials · ${s.title || ''}` }) },
        }),
        defineArrayMember({
          name: 'photoBreak',
          title: 'Photo break (full-width image + caption)',
          type: 'object',
          description: 'A cinematic full-width photo moment with a short caption. Use as a breather between heavy sections.',
          fields: [
            eyebrow,
            headline,
            defineField({ name: 'sub', title: 'Caption', type: 'text', rows: 3 }),
            defineField({
              name: 'imageUpload',
              title: 'Image (upload or pick from media library)',
              type: 'image',
              options: { hotspot: true },
              description: 'Preferred. Overrides the image path below when set.',
            }),
            defineField({
              name: 'image',
              title: 'Image path (fallback)',
              type: 'string',
              initialValue: '/Images/campaign/tea.jpg',
            }),
          ],
          preview: { select: { title: 'headline' }, prepare: (s) => ({ title: `Photo · ${s.title || ''}` }) },
        }),
        defineArrayMember({
          name: 'ctaBanner',
          title: 'Call-to-action banner (blue glow + buttons)',
          type: 'object',
          description: 'Centered conversion moment: headline, one line of text, primary + secondary button on the blue glow.',
          fields: [
            eyebrow,
            headline,
            defineField({ name: 'sub', title: 'Text', type: 'text', rows: 2 }),
            defineField({ name: 'primaryLabel', title: 'Primary button label', type: 'string' }),
            defineField({
              name: 'primaryHref',
              title: 'Primary button link',
              type: 'string',
              description: 'Internal path or full URL. Empty = the Carl Ras shop.',
            }),
            defineField({ name: 'secondaryLabel', title: 'Secondary button label', type: 'string' }),
            defineField({ name: 'secondaryHref', title: 'Secondary button link', type: 'string' }),
          ],
          preview: { select: { title: 'headline' }, prepare: (s) => ({ title: `CTA · ${s.title || ''}` }) },
        }),
        defineArrayMember({
          name: 'guaranteeAsk',
          title: 'Guarantee + numbered steps',
          type: 'object',
          description: 'The risk-reversal section: big promise, numbered step cards, buy buttons and the guarantee modal.',
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
          title: 'FAQ accordion',
          type: 'object',
          description: 'Questions and answers in an accordion. Also feeds Google/AI answer engines via structured data.',
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
        defineArrayMember({
          name: 'spacer',
          title: 'Spacer (empty breathing room)',
          type: 'object',
          description: 'Adds vertical space between sections when a page feels cramped.',
          fields: [
            defineField({
              name: 'size',
              title: 'Size',
              type: 'string',
              options: {
                list: [
                  { title: 'Small', value: 's' },
                  { title: 'Medium', value: 'm' },
                  { title: 'Large', value: 'l' },
                ],
                layout: 'radio',
                direction: 'horizontal',
              },
              initialValue: 'm',
            }),
          ],
          preview: { select: { title: 'size' }, prepare: (s) => ({ title: `Spacer · ${s.title || 'm'}` }) },
        }),
      ],
    }),
  ],
  preview: { select: { title: 'title', subtitle: 'slug.current' } },
});
