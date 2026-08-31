import { defineArrayMember, defineField, defineType, type PreviewValue } from 'sanity';
import HotspotPlacer from '../HotspotPlacer';
import SkuInput from '../SkuInput';
import { skuLabel } from '../lib/skuOptions';

/** Interactive hotspot image — one picture, numbered spots the visitor can open.
 *
 *  A reusable block, not a one-off: it drops into any landing or campaign page
 *  section list, sits on the Monthly lineup hero, and can annotate a product
 *  page. Editors place the spots by clicking the picture (sanity/HotspotPlacer)
 *  and write each spot's words in the list underneath. Positions are stored as
 *  percentages, so a spot lands in the same place on a phone and a 4K screen.
 *
 *  A spot may point at a product by item number: the card then shows the
 *  product name and links to it. The brand site shows no prices, here as
 *  everywhere (lib/catalog firewall). */

/** What Sanity accepts as a list item's thumbnail. */
type PreviewMedia = PreviewValue['media'];

export const hotspotImage = defineType({
  name: 'hotspotImage',
  title: 'Hotspot image (clickable points on a photo)',
  type: 'object',
  description:
    'One photo with numbered points on it. The visitor taps a point and a small card opens with the title, the text and, if you set one, a link to the product. Good for showing what a tool is made of, or what is in a kit.',
  initialValue: {
    eyebrow: 'Up close',
    headline: 'Every detail, *explained.*',
  },
  fields: [
    defineField({ name: 'eyebrow', title: 'Eyebrow label', type: 'string', description: 'The small uppercase label above the headline. Optional.' }),
    defineField({
      name: 'headline',
      title: 'Headline',
      type: 'text',
      rows: 2,
      description: 'Wrap a word in *asterisks* for the blue accent. Press Enter for a line break. Optional.',
    }),
    defineField({ name: 'sub', title: 'Subline', type: 'text', rows: 2 }),
    defineField({
      name: 'imageUpload',
      title: 'Photo (upload or pick from media library)',
      type: 'image',
      options: { hotspot: true },
      description: 'Preferred. Overrides the image path below when set. Landscape photos work best.',
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt text',
          type: 'string',
          description: 'Describe the photo for screen readers and image search.',
        }),
      ],
    }),
    defineField({
      name: 'image',
      title: 'Photo path (fallback)',
      type: 'string',
      description: 'Path under /public, e.g. /Images/campaign/rings.jpg. Used when no photo is uploaded.',
    }),
    defineField({
      name: 'fit',
      title: 'How the photo fills the frame',
      type: 'string',
      description:
        'Fill the frame suits a photograph. Show the whole product suits a cut-out product shot on a plain background, where cropping would cut the tool in half.',
      options: {
        list: [
          { title: 'Fill the frame (photographs)', value: 'cover' },
          { title: 'Show the whole product (product shots)', value: 'contain' },
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
      initialValue: 'cover',
    }),
    defineField({
      name: 'spots',
      title: 'The spots',
      type: 'array',
      components: { input: HotspotPlacer },
      description: 'Click the photo above to place a spot. Up to 8 keeps the picture readable.',
      validation: (r) => r.max(12),
      of: [
        defineArrayMember({
          type: 'object',
          name: 'hotspot',
          initialValue: { x: 50, y: 50 },
          fields: [
            defineField({ name: 'title', title: 'Title', type: 'string', validation: (r) => r.required() }),
            defineField({ name: 'body', title: 'Text', type: 'text', rows: 3, description: 'One or two sentences. Keep it short, it opens in a small card.' }),
            defineField({
              name: 'sku',
              title: 'Product (optional)',
              type: 'string',
              components: { input: SkuInput },
              description: 'Link the spot to a product by item number. The card then shows the product name and links to its page.',
            }),
            defineField({
              name: 'href',
              title: 'Link (optional)',
              type: 'string',
              description: 'Internal path (/products) or full URL. Ignored when a product is set above.',
            }),
            defineField({
              name: 'x',
              title: 'Horizontal position (%)',
              type: 'number',
              description: 'Set by clicking the photo. 0 = far left, 100 = far right.',
              validation: (r) => r.min(0).max(100),
            }),
            defineField({
              name: 'y',
              title: 'Vertical position (%)',
              type: 'number',
              description: 'Set by clicking the photo. 0 = top, 100 = bottom.',
              validation: (r) => r.min(0).max(100),
            }),
          ],
          preview: {
            select: { title: 'title', sku: 'sku', x: 'x', y: 'y' },
            prepare: ({ title, sku, x, y }: { title?: string; sku?: string; x?: number; y?: number }) => ({
              title: title || 'Spot',
              subtitle: [sku ? skuLabel(sku) : null, `at ${Math.round(x ?? 50)}% / ${Math.round(y ?? 50)}%`].filter(Boolean).join(' · '),
            }),
          },
        }),
      ],
    }),
  ],
  preview: {
    select: { title: 'headline', spots: 'spots', media: 'imageUpload' },
    prepare: ({ title, spots, media }: { title?: string; spots?: unknown[]; media?: PreviewMedia }) => ({
      title: `Hotspot image · ${title || ''}`,
      subtitle: `${(spots ?? []).length} spot${(spots ?? []).length === 1 ? '' : 's'}`,
      media,
    }),
  },
});
