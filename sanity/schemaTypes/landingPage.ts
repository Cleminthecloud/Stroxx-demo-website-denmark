import { defineArrayMember, defineField, defineType } from 'sanity';
import SeoPreviewField from '../SeoPreviewField';
import SkuListInput from '../SkuListInput';

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
    defineField({ name: 'seoTitle', title: 'SEO title', type: 'string', description: 'The title Google and share cards show. Under 60 characters. Empty = the page title.' }),
    defineField({ name: 'seoDescription', title: 'SEO description', type: 'text', rows: 3, description: 'The snippet under the title in Google. Under 155 characters.' }),
    defineField({
      name: 'ogImage',
      title: 'Share image (social)',
      description: 'Shown when this page is shared on LinkedIn/Facebook etc. 1200x630 works best. Empty = the site-wide share image from Site settings.',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'seoPreview',
      title: 'SEO preview (live)',
      description: 'How this page looks in a Google result and a shared link, built from the fields above as you type. Nothing to fill in here.',
      type: 'string',
      readOnly: true,
      components: { input: SeoPreviewField },
    }),
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
          initialValue: {
            eyebrow: 'New here',
            headline: 'A headline that *earns its keep.*',
            sub: 'One or two lines that tell the visitor exactly what this page gives them.',
            ctaLabel: 'See the tools',
          },
          fields: [
            eyebrow,
            headline,
            defineField({ name: 'sub', title: 'Subline', type: 'text', rows: 3, description: accentNote }),
            defineField({ name: 'ctaLabel', title: 'Primary button label', type: 'string' }),
            defineField({
              name: 'ctaHref',
              title: 'Primary button link',
              type: 'string',
              description: 'Internal path (/produkter) or full URL. Empty = the retailer’s webshop.',
            }),
            defineField({ name: 'secondaryLabel', title: 'Secondary link label', type: 'string' }),
            defineField({
              name: 'secondaryHref',
              title: 'Secondary link',
              type: 'string',
              description: 'Internal path or full URL. Empty = scrolls to the next section.',
            }),
            defineField({
              name: 'imageUpload',
              title: 'Image (upload or pick from media library)',
              type: 'image',
              options: { hotspot: true },
              description: 'Preferred. Overrides the image path below when set.',
              fields: [
                defineField({
                  name: 'alt',
                  title: 'Alt text',
                  type: 'string',
                  description: 'Describe the image for screen readers and image search. Leave empty for purely decorative photos.',
                }),
              ],
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
          initialValue: {
            eyebrow: 'The point',
            headline: 'Say the one thing *that matters.*',
            paragraphs: [
              'Back the headline with a short paragraph that explains the claim in plain language.',
              'End on the strongest line. This last paragraph renders white for emphasis.',
            ],
          },
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
          initialValue: {
            eyebrow: 'The numbers',
            headline: 'Claims are cheap. *Numbers stick.*',
            paragraphs: ['Replace or keep these real STROXX numbers; invented stats erode trust faster than no stats.'],
            stats: [
              { _type: 'stat', value: 1400, suffix: '+', label: 'Item numbers' },
              { _type: 'stat', value: 227, suffix: '+', label: 'Stores in Europe' },
              { _type: 'stat', value: 30, suffix: ' days', label: 'Satisfaction guarantee' },
            ],
          },
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
              description: '1, 2 or 3 numbers; the row adapts.',
              validation: (r) => r.max(3),
              of: [
                defineArrayMember({
                  type: 'object',
                  name: 'stat',
                  initialValue: { value: 100, suffix: '+', label: 'Replace this label' },
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
          initialValue: {
            eyebrow: 'Up close',
            headline: 'Show it *in real hands.*',
            body: 'Two or three sentences about the image beside this text. Swap the photo, keep it honest.',
            ctaLabel: 'See the products',
            image: '/Images/campaign/rings.jpg',
          },
          fields: [
            eyebrow,
            headline,
            defineField({ name: 'body', title: 'Text', type: 'text', rows: 5 }),
            defineField({ name: 'ctaLabel', title: 'Button label (optional)', type: 'string' }),
            defineField({
              name: 'ctaHref',
              title: 'Button link',
              type: 'string',
              description: 'Internal path (/produkter) or full URL. Defaults to the retailer’s webshop.',
            }),
            defineField({
              name: 'imageUpload',
              title: 'Image (upload or pick from media library)',
              type: 'image',
              options: { hotspot: true },
              description: 'Preferred. Overrides the image path below when set.',
              fields: [
                defineField({
                  name: 'alt',
                  title: 'Alt text',
                  type: 'string',
                  description: 'Describe the image for screen readers and image search. Leave empty for purely decorative photos.',
                }),
              ],
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
          initialValue: {
            eyebrow: 'Why it works',
            headline: 'Three reasons *pros switch.*',
            items: [
              { _type: 'feature', title: 'Pro quality', body: 'The same feel and finish as the big brands. The badge premium is the only thing missing.' },
              { _type: 'feature', title: 'A fair price', body: 'Specifications set by tradespeople, no logo tax, no middlemen.' },
              { _type: 'feature', title: '30-day guarantee', body: 'Work it hard for a month. Not convinced? Money back at the dealer.' },
            ],
          },
          fields: [
            eyebrow,
            headline,
            defineField({
              name: 'items',
              title: 'Cards',
              type: 'array',
              description: 'The row balances itself at any count; 2, 3, 4 or 6 cards look best.',
              validation: (r) => r.max(6),
              of: [
                defineArrayMember({
                  type: 'object',
                  name: 'feature',
                  initialValue: { title: 'New card', body: 'One or two sentences that earn this card its place.' },
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
          description: 'A grid of live product cards. Enter item numbers (SKU); name, photo and price data come from the product feed.',
          initialValue: {
            eyebrow: 'The proof',
            headline: 'The tools *do the talking.*',
            sub: 'Swap these item numbers for the products this page is about.',
            skus: ['34011573', '34009021', '35011812', '35011846'],
          },
          fields: [
            eyebrow,
            headline,
            defineField({ name: 'sub', title: 'Subline', type: 'text', rows: 3 }),
            defineField({
              name: 'skus',
              title: 'Products',
              description: 'Search and add products from the range; use ↑ ↓ to set the card order. Unknown item numbers are skipped.',
              type: 'array',
              of: [defineArrayMember({ type: 'string' })],
              components: { input: SkuListInput },
            }),
          ],
          preview: { select: { title: 'headline' }, prepare: (s) => ({ title: `Products · ${s.title || ''}` }) },
        }),
        defineArrayMember({
          name: 'videoProof',
          title: 'Video gallery (partner films)',
          type: 'object',
          description: 'The film section: partner YouTube videos in a lightweight player.',
          initialValue: {
            eyebrow: 'On the job',
            headline: 'See it *at work.*',
            sub: 'The films come from the Film collection; this block just gives them a home on this page.',
          },
          fields: [eyebrow, headline, defineField({ name: 'sub', title: 'Subline', type: 'text', rows: 3 })],
          preview: { select: { title: 'headline' }, prepare: (s) => ({ title: `Video · ${s.title || ''}` }) },
        }),
        defineArrayMember({
          name: 'quote',
          title: 'Pull quote (one big citation)',
          type: 'object',
          description: 'One large quote with attribution. Stronger than a testimonial grid when you have a single killer line.',
          initialValue: {
            text: 'One line from a real customer that says more than a page of marketing ever could.',
            attribution: 'Name Surname',
            role: 'Carpenter, Aarhus',
          },
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
          initialValue: { eyebrow: 'From the trade', headline: 'The crew *has spoken.*' },
          fields: [eyebrow, headline],
          preview: { select: { title: 'headline' }, prepare: (s) => ({ title: `Testimonials · ${s.title || ''}` }) },
        }),
        defineArrayMember({
          name: 'photoBreak',
          title: 'Photo break (full-width image + caption)',
          type: 'object',
          description: 'A cinematic full-width photo moment with a short caption. Use as a breather between heavy sections.',
          initialValue: {
            eyebrow: 'Out there',
            headline: 'Let one photo *breathe.*',
            sub: 'A short caption is enough. Swap the photo for one from the campaign.',
          },
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
              fields: [
                defineField({
                  name: 'alt',
                  title: 'Alt text',
                  type: 'string',
                  description: 'Describe the image for screen readers and image search. Leave empty for purely decorative photos.',
                }),
              ],
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
          initialValue: {
            eyebrow: 'Ready?',
            headline: 'Try it. *Risk free.*',
            sub: 'The 30-day satisfaction guarantee carries the decision.',
            primaryLabel: 'Buy STROXX',
            secondaryLabel: 'Find a store',
          },
          fields: [
            eyebrow,
            headline,
            defineField({ name: 'sub', title: 'Text', type: 'text', rows: 2 }),
            defineField({ name: 'primaryLabel', title: 'Primary button label', type: 'string' }),
            defineField({
              name: 'primaryHref',
              title: 'Primary button link',
              type: 'string',
              description: 'Internal path or full URL. Empty = the retailer’s webshop.',
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
          initialValue: {
            eyebrow: 'The guarantee',
            headline: 'Try it for 30 days. *Then decide.*',
            sub: 'Money back if it does not deliver. Your own judgement is enough.',
            steps: [
              { _type: 'step', title: 'Buy it', body: 'Pick it up at the dealer or order online.' },
              { _type: 'step', title: 'Work it hard', body: 'Use it on real jobs for a month.' },
              { _type: 'step', title: 'Decide', body: 'Not convinced? Money back, no defect required.' },
            ],
            ctaLabel: 'Buy STROXX',
            secondaryLabel: 'Find a store',
          },
          fields: [
            eyebrow,
            headline,
            defineField({ name: 'sub', title: 'Subline', type: 'text', rows: 3 }),
            defineField({
              name: 'steps',
              title: 'Steps',
              type: 'array',
              description: 'The row balances itself at any count; 3 steps is the classic.',
              validation: (r) => r.max(6),
              of: [
                defineArrayMember({
                  type: 'object',
                  name: 'step',
                  initialValue: { title: 'New step', body: 'What the customer does at this step, one sentence.' },
                  fields: [
                    defineField({ name: 'title', title: 'Title', type: 'string' }),
                    defineField({ name: 'body', title: 'Body', type: 'text', rows: 3 }),
                  ],
                  preview: { select: { title: 'title' } },
                }),
              ],
            }),
            defineField({ name: 'ctaLabel', title: 'Primary button label', type: 'string' }),
            defineField({
              name: 'ctaHref',
              title: 'Primary button link',
              type: 'string',
              description: 'Internal path or full URL. Empty = the retailer’s webshop.',
            }),
            defineField({ name: 'secondaryLabel', title: 'Secondary button label', type: 'string' }),
            defineField({
              name: 'secondaryHref',
              title: 'Secondary button link',
              type: 'string',
              description: 'Internal path or full URL. Empty = the store finder.',
            }),
          ],
          preview: { select: { title: 'headline' }, prepare: (s) => ({ title: `Guarantee · ${s.title || ''}` }) },
        }),
        defineArrayMember({
          name: 'faqSection',
          title: 'FAQ accordion',
          type: 'object',
          description: 'Questions and answers in an accordion. Also feeds Google/AI answer engines via structured data.',
          initialValue: {
            eyebrow: 'Questions',
            headline: 'Asked *and answered.*',
            items: [
              {
                _type: 'faqItem',
                q: 'How does the 30-day satisfaction guarantee work?',
                a: 'Use the tool on real jobs for 30 days. Not satisfied? Money back at the dealer, your own judgement is enough.',
              },
              {
                _type: 'faqItem',
                q: 'Replace this with a question customers actually ask?',
                a: 'Answer in plain language, two or three sentences. Google and AI assistants read these answers too.',
              },
            ],
          },
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
                  initialValue: { q: 'A question customers actually ask?', a: 'The answer in plain language, two or three sentences.' },
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
          name: 'newsletter',
          title: 'Newsletter signup',
          type: 'object',
          description: 'Email signup form. Sends to the email platform chosen in Site settings → Newsletter (which must be configured and enabled).',
          initialValue: {
            eyebrow: 'Know-how',
            headline: 'Professional know-how. *No spam.*',
            sub: 'A couple of mails a month with tips, specialist advice and new tools.',
          },
          fields: [
            eyebrow,
            headline,
            defineField({ name: 'sub', title: 'Text', type: 'text', rows: 2 }),
            defineField({ name: 'buttonLabel', title: 'Button label', type: 'string', initialValue: 'Sign up' }),
            defineField({
              name: 'disclaimer',
              title: 'Consent line under the form',
              type: 'string',
              initialValue: 'Unsubscribe anytime. We only write when it is worth your time.',
            }),
          ],
          preview: { select: { title: 'headline' }, prepare: (s) => ({ title: `Newsletter · ${s.title || ''}` }) },
        }),
        defineArrayMember({
          name: 'contactForm',
          title: 'Contact form',
          type: 'object',
          description: 'Name/email/message form. Submissions go to the webhook the developer configures in the hosting environment (FORM_WEBHOOK_URL), e.g. a Zapier/Make flow into your inbox or CRM.',
          initialValue: {
            eyebrow: 'Contact',
            headline: 'Talk to *a human.*',
            sub: 'We answer within one working day.',
          },
          fields: [
            eyebrow,
            headline,
            defineField({ name: 'sub', title: 'Text', type: 'text', rows: 2 }),
            defineField({ name: 'topic', title: 'Topic tag (internal)', type: 'string', description: 'Included in every submission so you can tell forms apart, e.g. "summer-campaign".' }),
            defineField({ name: 'buttonLabel', title: 'Button label', type: 'string', initialValue: 'Send' }),
            defineField({ name: 'successMessage', title: 'Success message', type: 'string', initialValue: 'Thanks, we will get back to you within one working day.' }),
          ],
          preview: { select: { title: 'headline' }, prepare: (s) => ({ title: `Contact form · ${s.title || ''}` }) },
        }),
        defineArrayMember({
          name: 'beforeAfter',
          title: 'Before / after slider (drag to compare)',
          type: 'object',
          description: 'Two photos with a draggable divider. Proof beats claims: let people SEE the difference a tool makes.',
          initialValue: {
            eyebrow: 'The difference',
            headline: 'Drag. *See it yourself.*',
            sub: 'Swap these photos for a real before/after from a job. Same angle, same light, honest result.',
            beforeLabel: 'Before',
            afterLabel: 'After',
            beforeImage: '/Images/campaign/rings.jpg',
            afterImage: '/Images/campaign/tea.jpg',
          },
          fields: [
            eyebrow,
            headline,
            defineField({ name: 'sub', title: 'Subline', type: 'text', rows: 2 }),
            defineField({
              name: 'beforeUpload',
              title: 'Before photo (upload or pick from media library)',
              type: 'image',
              options: { hotspot: true },
              fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string' })],
            }),
            defineField({ name: 'beforeImage', title: 'Before photo path (fallback)', type: 'string' }),
            defineField({
              name: 'afterUpload',
              title: 'After photo (upload or pick from media library)',
              type: 'image',
              options: { hotspot: true },
              fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string' })],
            }),
            defineField({ name: 'afterImage', title: 'After photo path (fallback)', type: 'string' }),
            defineField({ name: 'beforeLabel', title: 'Left label', type: 'string', initialValue: 'Before' }),
            defineField({ name: 'afterLabel', title: 'Right label', type: 'string', initialValue: 'After' }),
          ],
          preview: { select: { title: 'headline' }, prepare: (s) => ({ title: `Before/after · ${s.title || ''}` }) },
        }),
        defineArrayMember({
          name: 'storyCards',
          title: 'Story cards (stack as you scroll)',
          type: 'object',
          description: 'Cards that stack on top of each other while scrolling. Built for a 3-5 step narrative: the job, the tool, the result.',
          initialValue: {
            eyebrow: 'The story',
            headline: 'One job. *Three chapters.*',
            cards: [
              { _type: 'storyCard', title: 'The job', body: 'Set the scene in two sentences: the site, the deadline, the problem that needed solving.' },
              { _type: 'storyCard', title: 'The tool', body: 'Which STROXX tool went to work, and what it had to prove.' },
              { _type: 'storyCard', title: 'The result', body: 'What the customer got, in their own words if you have them. End on the outcome, not the product.' },
            ],
          },
          fields: [
            eyebrow,
            headline,
            defineField({
              name: 'cards',
              title: 'Cards',
              type: 'array',
              description: '3-5 cards tell the best story. They stack in order as the reader scrolls.',
              validation: (r) => r.max(5),
              of: [
                defineArrayMember({
                  type: 'object',
                  name: 'storyCard',
                  initialValue: { title: 'New chapter', body: 'One or two sentences that move the story forward.' },
                  fields: [
                    defineField({ name: 'title', title: 'Card title', type: 'string' }),
                    defineField({ name: 'body', title: 'Card text', type: 'text', rows: 4 }),
                    defineField({
                      name: 'imageUpload',
                      title: 'Photo (optional)',
                      type: 'image',
                      options: { hotspot: true },
                      fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string' })],
                    }),
                    defineField({ name: 'image', title: 'Photo path (fallback)', type: 'string' }),
                  ],
                  preview: { select: { title: 'title' } },
                }),
              ],
            }),
          ],
          preview: { select: { title: 'headline' }, prepare: (s) => ({ title: `Story cards · ${s.title || ''}` }) },
        }),
        defineArrayMember({
          name: 'logoMarquee',
          title: 'Logo band (partners, scrolling)',
          type: 'object',
          description: 'A slow scrolling band of partner names or logos. Names render as wordmarks until a logo file is uploaded.',
          initialValue: {
            eyebrow: 'Sold by the trade, for the trade',
            logos: [
              { _type: 'marqueeLogo', name: 'Carl Ras' },
              { _type: 'marqueeLogo', name: 'Meesenburg' },
              { _type: 'marqueeLogo', name: 'Foussier' },
              { _type: 'marqueeLogo', name: 'Lecot' },
            ],
          },
          fields: [
            eyebrow,
            defineField({
              name: 'logos',
              title: 'Partners',
              type: 'array',
              validation: (r) => r.max(8),
              of: [
                defineArrayMember({
                  type: 'object',
                  name: 'marqueeLogo',
                  initialValue: { name: 'Partner name' },
                  fields: [
                    defineField({ name: 'name', title: 'Name', type: 'string', validation: (r) => r.required() }),
                    defineField({ name: 'logoUpload', title: 'Logo (optional, shown grayscale)', type: 'image' }),
                    defineField({ name: 'image', title: 'Logo path (fallback)', type: 'string' }),
                    defineField({ name: 'href', title: 'Link (optional)', type: 'string' }),
                  ],
                  preview: { select: { title: 'name' } },
                }),
              ],
            }),
          ],
          preview: { select: { title: 'eyebrow' }, prepare: (s) => ({ title: `Logo band · ${s.title || ''}` }) },
        }),
        defineArrayMember({
          name: 'embed',
          title: 'Embed (form, map or video from another service)',
          type: 'object',
          description:
            'Embeds a page from an APPROVED provider (Typeform, Microsoft/Google forms, Google Maps, YouTube, Vimeo, the retailer’s and STROXX’s own pages). Visitors click before anything loads, GDPR-clean. Other providers: ask the developer to approve them. Script widgets are installed via GTM instead, never here.',
          initialValue: {
            eyebrow: 'Take part',
            headline: 'A form, map or film *right here.*',
            height: 600,
          },
          fields: [
            eyebrow,
            headline,
            defineField({ name: 'sub', title: 'Subline', type: 'text', rows: 2 }),
            defineField({
              name: 'url',
              title: 'Address of the embedded page',
              type: 'url',
              description: 'The full https:// share/embed address from the provider.',
              validation: (r) => r.uri({ scheme: ['https'] }),
            }),
            defineField({
              name: 'height',
              title: 'Height (pixels)',
              type: 'number',
              initialValue: 600,
              description: '600 suits most forms; make it taller if the form scrolls inside itself.',
            }),
          ],
          preview: { select: { title: 'headline', subtitle: 'url' }, prepare: (s) => ({ title: `Embed · ${s.title || ''}`, subtitle: s.subtitle }) },
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
