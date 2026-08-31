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
 *  MULTIPLE ANGLES: the main photo is the first view, and "More angles" adds
 *  further views, each with its OWN photo and its OWN spots. One angle is the
 *  common case and stays a single picture with no switcher; add an angle and a
 *  small Front/Back/Detail switcher appears. The flat main-photo fields are
 *  deliberately kept rather than folded into the array: an editor with one
 *  photo should never have to think about views at all, and existing content
 *  keeps working untouched.
 *
 *  A spot may point at a product by item number: the card then shows the
 *  product name and links to it. The brand site shows no prices, here as
 *  everywhere (lib/catalog firewall). */

/** What Sanity accepts as a list item's thumbnail. */
type PreviewMedia = PreviewValue['media'];

const altField = defineField({
  name: 'alt',
  title: 'Alt text',
  type: 'string',
  description: 'Describe the photo for screen readers and image search.',
});

/** The image + fit + spots trio, shared by the main photo and every extra
 *  angle, so a spot behaves identically wherever it is placed. */
const imageFields = [
  defineField({
    name: 'imageUpload',
    title: 'Photo (upload or pick from media library)',
    type: 'image',
    options: { hotspot: true },
    description: 'Preferred. Overrides the image path below when set. Landscape photos work best.',
    fields: [altField],
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
];

export const hotspotImage = defineType({
  name: 'hotspotImage',
  title: 'Hotspot image (clickable points on a photo)',
  type: 'object',
  description:
    'One photo with numbered points on it. The visitor taps a point and a small card opens with the title, the text and, if you set one, a link to the product. Add more angles and a switcher appears above the picture. Good for showing what a tool is made of, or what is in a kit.',
  fieldsets: [
    { name: 'main', title: 'The photo and its spots', options: { collapsible: true, collapsed: false } },
    { name: 'angles', title: 'More angles (optional)', options: { collapsible: true, collapsed: true } },
  ],
  initialValue: {
    eyebrow: 'Up close',
    headline: 'Every detail, *explained.*',
    viewLabel: 'Front',
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
    ...imageFields.map((f) => ({ ...f, fieldset: 'main' })),
    defineField({
      name: 'viewLabel',
      title: 'Name of this angle',
      type: 'string',
      fieldset: 'main',
      description: 'Only shown when there is more than one angle, as the label on the switcher. E.g. Front.',
    }),
    defineField({
      name: 'moreViews',
      title: 'More angles',
      type: 'array',
      fieldset: 'angles',
      description:
        'Leave empty for a single picture, which is the usual case. Add an angle and a switcher appears above the photo, each angle carrying its own spots. Three angles is plenty.',
      validation: (r) => r.max(5),
      of: [
        defineArrayMember({
          type: 'object',
          name: 'hotspotView',
          fields: [
            defineField({
              name: 'label',
              title: 'Name of this angle',
              type: 'string',
              description: 'The label on the switcher, e.g. Back, Underside, In use.',
              validation: (r) => r.required(),
            }),
            ...imageFields,
          ],
          preview: {
            select: { title: 'label', spots: 'spots', media: 'imageUpload' },
            prepare: ({ title, spots, media }: { title?: string; spots?: unknown[]; media?: PreviewMedia }) => ({
              title: title || 'Angle',
              subtitle: `${(spots ?? []).length} spot${(spots ?? []).length === 1 ? '' : 's'}`,
              media,
            }),
          },
        }),
      ],
    }),
  ],
  preview: {
    select: { title: 'headline', spots: 'spots', more: 'moreViews', media: 'imageUpload' },
    prepare: ({ title, spots, more, media }: { title?: string; spots?: unknown[]; more?: unknown[]; media?: PreviewMedia }) => {
      const angles = 1 + (more ?? []).length;
      return {
        title: `Hotspot image · ${title || ''}`,
        subtitle: `${(spots ?? []).length} spot${(spots ?? []).length === 1 ? '' : 's'}${angles > 1 ? ` · ${angles} angles` : ''}`,
        media,
      };
    },
  },
});
