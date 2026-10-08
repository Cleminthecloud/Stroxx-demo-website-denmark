import { defineArrayMember, defineField } from 'sanity';

/** Section blocks added for the "Focus on…" product pages (ported from the
 *  Webflow fokus-paa pages, October 2026). They join the shared landing-page
 *  block menu (landingSectionMembers), so every block also works on campaign
 *  pages. Rendered in components/cms/LandingSections.tsx; live samples at
 *  /components.
 *
 *  Rules baked in:
 *  - NO PRICES anywhere (the brand site never shows a price, lib/catalog).
 *  - Links to a dealer webshop are resolved per market: a product item number
 *    sends the visitor to THEIR dealer, and a hard Carl Ras link is swapped for
 *    the dealer chooser outside Denmark (lib/focus isForeignDealerUrl).
 *  - Product shots stay in colour, scenes go black and white (brand plan). */

const accentNote = 'Wrap a word in *asterisks* for the blue accent. Press Enter for a line break.';

const eyebrow = defineField({
  name: 'eyebrow',
  title: 'Eyebrow label',
  type: 'string',
  description: 'The small uppercase label above the headline. Optional.',
});
const headline = defineField({ name: 'headline', title: 'Headline', type: 'text', rows: 2, description: accentNote });
const intro = defineField({ name: 'intro', title: 'Intro text', type: 'text', rows: 3 });

const altField = defineField({
  name: 'alt',
  title: 'Alt text',
  type: 'string',
  description: 'Describe the image for screen readers and image search.',
});
const imageField = (name: string, title: string, description?: string) =>
  defineField({ name, title, type: 'image', options: { hotspot: true }, description, fields: [altField] });

const linkFields = [
  defineField({ name: 'linkLabel', title: 'Link label', type: 'string' }),
  defineField({
    name: 'href',
    title: 'Link',
    type: 'string',
    description: 'Internal path (/focus-on) or full https:// address. A Carl Ras link only ever shows in Denmark; elsewhere the visitor gets their own dealer.',
  }),
  defineField({
    name: 'itemNumber',
    title: 'Product item number (optional)',
    type: 'string',
    description: 'The dealer item number (varenummer). Used when the link is empty: sends the visitor to this product at their own dealer.',
  }),
];

export const focusBlockMembers = [
  defineArrayMember({
    name: 'textIntro',
    title: 'Text: headline + paragraph (+ button)',
    type: 'object',
    description: 'A plain heading and a paragraph, with an optional button and small note. The quiet block between the louder ones.',
    initialValue: { eyebrow: 'Worth knowing', headline: 'Say one thing *clearly.*', intro: 'Two or three sentences. One idea.' },
    fields: [
      eyebrow,
      headline,
      intro,
      defineField({ name: 'ctaLabel', title: 'Button label (optional)', type: 'string' }),
      defineField({ name: 'ctaHref', title: 'Button link', type: 'string', description: 'Internal path or full URL. Empty with an item number = the visitor’s dealer.' }),
      defineField({ name: 'itemNumber', title: 'Button: product item number (optional)', type: 'string' }),
      defineField({ name: 'note', title: 'Small note under the text (optional)', type: 'text', rows: 2 }),
      defineField({
        name: 'align',
        title: 'Alignment',
        type: 'string',
        options: { list: ['left', 'center'], layout: 'radio', direction: 'horizontal' },
        initialValue: 'left',
      }),
    ],
    preview: { select: { title: 'headline', subtitle: 'eyebrow' }, prepare: (s) => ({ title: `Text · ${s.title || ''}`, subtitle: s.subtitle }) },
  }),

  defineArrayMember({
    name: 'numberedTabs',
    title: 'Numbered points with photo (tabs)',
    type: 'object',
    description:
      'Three or four numbered selling points on one side, a photo on the other that changes with the selected point. On phones the points stack, each with its own photo.',
    initialValue: { eyebrow: 'What makes it smart', headline: 'Three reasons, *one tool.*' },
    fields: [
      eyebrow,
      headline,
      intro,
      defineField({
        name: 'items',
        title: 'Points',
        type: 'array',
        validation: (r) => r.min(2).max(6),
        of: [
          defineArrayMember({
            type: 'object',
            name: 'tabItem',
            fields: [
              defineField({ name: 'title', title: 'Title', type: 'string', validation: (r) => r.required() }),
              defineField({ name: 'body', title: 'Text', type: 'text', rows: 3 }),
              imageField('imageUpload', 'Photo'),
              defineField({ name: 'colour', title: 'Keep this photo in colour', type: 'boolean', initialValue: true }),
            ],
            preview: { select: { title: 'title', media: 'imageUpload' } },
          }),
        ],
      }),
    ],
    preview: { select: { title: 'headline' }, prepare: (s) => ({ title: `Numbered points · ${s.title || ''}` }) },
  }),

  defineArrayMember({
    name: 'filmSection',
    title: 'Film (self-hosted, plays in view)',
    type: 'object',
    description:
      'A film from our own servers, not YouTube: no cookie banner in the way. Plays muted when scrolled into view and pauses when it leaves; controls are always there.',
    fields: [
      eyebrow,
      headline,
      defineField({ name: 'videoFile', title: 'Video file', type: 'file', options: { accept: 'video/mp4,video/webm' }, description: '.mp4 (H.264), under 30 MB.' }),
      defineField({ name: 'videoUrl', title: 'Or video URL', type: 'string', description: 'Direct .mp4 link. Used when no file is uploaded.' }),
      imageField('posterUpload', 'Poster image', 'The still shown before the film plays.'),
      defineField({
        name: 'ratio',
        title: 'Shape',
        type: 'string',
        options: {
          list: [
            { title: 'Wide 16:9', value: '16/9' },
            { title: 'Portrait 4:5', value: '4/5' },
            { title: 'Square 1:1', value: '1/1' },
          ],
          layout: 'radio',
          direction: 'horizontal',
        },
        initialValue: '16/9',
      }),
      defineField({ name: 'caption', title: 'Caption (optional)', type: 'text', rows: 2 }),
      defineField({
        name: 'footnote',
        title: 'Footnote / AI disclosure (optional)',
        type: 'string',
        description: 'E.g. "AI-generated content" or "Real footage, only stabilised and cropped". Required wording when the film is AI-made.',
      }),
    ],
    preview: { select: { title: 'headline', subtitle: 'caption' }, prepare: (s) => ({ title: `Film · ${s.title || s.subtitle || ''}` }) },
  }),

  defineArrayMember({
    name: 'comparisonTable',
    title: 'Comparison table (2 to 4 options)',
    type: 'object',
    description:
      'Options side by side, row by row. Each cell is a tick, a cross or a short text. Mark one column as the highlighted one. Scrolls sideways on phones with the row labels pinned.',
    initialValue: { eyebrow: 'Compare', headline: 'Which one *fits the job?*' },
    fields: [
      eyebrow,
      headline,
      intro,
      defineField({ name: 'cornerLabel', title: 'Top-left label', type: 'string', initialValue: 'STROXX' }),
      defineField({
        name: 'columns',
        title: 'Options (columns)',
        type: 'array',
        validation: (r) => r.min(2).max(4),
        of: [
          defineArrayMember({
            type: 'object',
            name: 'cmpColumn',
            fields: [
              defineField({ name: 'name', title: 'Name', type: 'string', validation: (r) => r.required() }),
              defineField({ name: 'note', title: 'Small line under the name', type: 'string', description: 'E.g. full product name and item number.' }),
              defineField({ name: 'tag', title: 'Tag (optional)', type: 'string', description: 'A small label, e.g. "Focus product".' }),
              defineField({ name: 'highlight', title: 'Highlight this column', type: 'boolean', initialValue: false }),
            ],
            preview: { select: { title: 'name', subtitle: 'note' } },
          }),
        ],
      }),
      defineField({
        name: 'rows',
        title: 'Rows',
        type: 'array',
        of: [
          defineArrayMember({
            type: 'object',
            name: 'cmpRow',
            fields: [
              defineField({ name: 'label', title: 'Row label', type: 'string', validation: (r) => r.required() }),
              defineField({
                name: 'cells',
                title: 'Cells, one per option, left to right',
                description: 'Type the value, or a single + for a tick and a single - for a cross.',
                type: 'array',
                of: [{ type: 'string' }],
              }),
            ],
            preview: {
              select: { title: 'label', cells: 'cells' },
              prepare: ({ title, cells }: { title?: string; cells?: string[] }) => ({ title, subtitle: (cells || []).join('  |  ') }),
            },
          }),
        ],
      }),
      defineField({
        name: 'notes',
        title: 'Notes under the table (optional)',
        type: 'array',
        of: [
          defineArrayMember({
            type: 'object',
            name: 'cmpNote',
            fields: [
              defineField({ name: 'title', title: 'Title', type: 'string' }),
              defineField({ name: 'body', title: 'Text', type: 'text', rows: 3 }),
            ],
            preview: { select: { title: 'title' } },
          }),
        ],
      }),
    ],
    preview: { select: { title: 'headline' }, prepare: (s) => ({ title: `Comparison · ${s.title || ''}` }) },
  }),

  defineArrayMember({
    name: 'bentoCompare',
    title: 'Two-way comparison tiles (A versus B)',
    type: 'object',
    description: 'Tiles that each compare the same question for two approaches, e.g. finger versus palm. Wide tiles carry a "why it matters" line.',
    fields: [
      defineField({ name: 'title', title: 'Heading', type: 'string' }),
      defineField({ name: 'labelA', title: 'Label A', type: 'string', initialValue: 'Before' }),
      defineField({ name: 'labelB', title: 'Label B (the winner)', type: 'string', initialValue: 'STROXX' }),
      defineField({
        name: 'tiles',
        title: 'Tiles',
        type: 'array',
        of: [
          defineArrayMember({
            type: 'object',
            name: 'bentoTile',
            fields: [
              defineField({ name: 'question', title: 'Question', type: 'string', validation: (r) => r.required() }),
              defineField({ name: 'a', title: 'Answer A', type: 'string' }),
              defineField({ name: 'b', title: 'Answer B', type: 'string' }),
              defineField({ name: 'why', title: 'Why it matters (optional)', type: 'text', rows: 3 }),
              defineField({ name: 'wide', title: 'Wide tile', type: 'boolean', initialValue: false }),
            ],
            preview: { select: { title: 'question', subtitle: 'b' } },
          }),
        ],
      }),
    ],
    preview: { select: { title: 'title' }, prepare: (s) => ({ title: `A versus B · ${s.title || ''}` }) },
  }),

  defineArrayMember({
    name: 'specGrid',
    title: 'Specifications (big numbers)',
    type: 'object',
    description: 'The hard facts as large numbers with a unit and one line each. Numbers count up when scrolled into view.',
    initialValue: { eyebrow: 'Specifications', headline: 'The numbers *behind it.*' },
    fields: [
      eyebrow,
      headline,
      intro,
      defineField({
        name: 'specs',
        title: 'Specs',
        type: 'array',
        of: [
          defineArrayMember({
            type: 'object',
            name: 'spec',
            fields: [
              defineField({ name: 'value', title: 'Value', type: 'string', description: 'E.g. 1500, 1,5, IP65, 40 til 100.', validation: (r) => r.required() }),
              defineField({ name: 'unit', title: 'Unit / label', type: 'string', description: 'E.g. lumen, seconds, mm door thickness.' }),
              defineField({ name: 'body', title: 'Text', type: 'text', rows: 2 }),
            ],
            preview: { select: { title: 'value', subtitle: 'unit' } },
          }),
        ],
      }),
      defineField({ name: 'note', title: 'Note under the specs (optional)', type: 'text', rows: 3 }),
    ],
    preview: { select: { title: 'headline' }, prepare: (s) => ({ title: `Specs · ${s.title || ''}` }) },
  }),

  defineArrayMember({
    name: 'modelCards',
    title: 'Variant / fact cards (key-value rows)',
    type: 'object',
    description: 'Cards with a name, a one-line use, and key/value rows, e.g. three lengths of the same product, or "What is in the box". Each card can link out.',
    fields: [
      defineField({ name: 'title', title: 'Heading', type: 'string' }),
      defineField({ name: 'intro', title: 'Intro text', type: 'text', rows: 2 }),
      defineField({
        name: 'cards',
        title: 'Cards',
        type: 'array',
        validation: (r) => r.max(4),
        of: [
          defineArrayMember({
            type: 'object',
            name: 'modelCard',
            fields: [
              defineField({ name: 'name', title: 'Name', type: 'string', validation: (r) => r.required() }),
              defineField({ name: 'use', title: 'One-line use', type: 'string' }),
              defineField({ name: 'highlight', title: 'Highlight this card', type: 'boolean', initialValue: false }),
              defineField({
                name: 'rows',
                title: 'Rows',
                type: 'array',
                of: [
                  defineArrayMember({
                    type: 'object',
                    name: 'kv',
                    fields: [
                      defineField({ name: 'key', title: 'Label', type: 'string' }),
                      defineField({ name: 'value', title: 'Value', type: 'string' }),
                    ],
                    preview: { select: { title: 'key', subtitle: 'value' } },
                  }),
                ],
              }),
              ...linkFields,
            ],
            preview: { select: { title: 'name', subtitle: 'use' } },
          }),
        ],
      }),
      defineField({ name: 'foot', title: 'Line under the cards (optional)', type: 'text', rows: 2 }),
    ],
    preview: { select: { title: 'title' }, prepare: (s) => ({ title: `Fact cards · ${s.title || ''}` }) },
  }),

  defineArrayMember({
    name: 'rangeAdvisor',
    title: 'Slider advisor (value → recommendation)',
    type: 'object',
    description:
      'A slider the visitor drags (e.g. door thickness) and a recommendation that follows (e.g. which spindle length). You set the steps: each step says "up to this value, recommend that".',
    initialValue: { label: 'Door thickness', unit: 'mm', min: 40, max: 100, step: 1, defaultValue: 55 },
    fields: [
      defineField({ name: 'title', title: 'Heading', type: 'string' }),
      defineField({ name: 'intro', title: 'Intro text', type: 'text', rows: 2 }),
      defineField({ name: 'label', title: 'Slider label', type: 'string', validation: (r) => r.required() }),
      defineField({ name: 'unit', title: 'Unit', type: 'string' }),
      defineField({ name: 'min', title: 'Minimum', type: 'number', validation: (r) => r.required() }),
      defineField({ name: 'max', title: 'Maximum', type: 'number', validation: (r) => r.required() }),
      defineField({ name: 'step', title: 'Step', type: 'number', initialValue: 1 }),
      defineField({ name: 'defaultValue', title: 'Starting value', type: 'number' }),
      defineField({
        name: 'bands',
        title: 'Steps (up to → recommend)',
        type: 'array',
        of: [
          defineArrayMember({
            type: 'object',
            name: 'band',
            fields: [
              defineField({ name: 'upTo', title: 'Up to and including', type: 'number', validation: (r) => r.required() }),
              defineField({ name: 'result', title: 'Recommend', type: 'string', validation: (r) => r.required(), description: 'Short, e.g. 80.' }),
            ],
            preview: {
              select: { upTo: 'upTo', result: 'result' },
              prepare: ({ upTo, result }: { upTo?: number; result?: string }) => ({ title: `≤ ${upTo ?? '?'} → ${result || ''}` }),
            },
          }),
        ],
      }),
      defineField({
        name: 'resultTemplate',
        title: 'Recommendation sentence',
        type: 'string',
        description: 'Use {value} for the slider value and {result} for the recommendation, e.g. "Use spindle 8x8x{result} mm".',
        initialValue: 'Recommended: {result}',
      }),
      defineField({ name: 'valueLabel', title: 'Bar label: value', type: 'string', description: 'E.g. "{value} mm door". Empty = hidden.' }),
      defineField({ name: 'resultLabel', title: 'Bar label: recommendation', type: 'string', description: 'E.g. "{result} mm spindle". Empty = hidden.' }),
    ],
    preview: { select: { title: 'title', subtitle: 'label' }, prepare: (s) => ({ title: `Slider advisor · ${s.title || s.subtitle || ''}` }) },
  }),

  defineArrayMember({
    name: 'safetyNotice',
    title: 'Safety notice (important box)',
    type: 'object',
    description: 'A framed warning: the one thing people must do or must not do. Use sparingly so it stays loud.',
    initialValue: { eyebrow: 'Important', headline: 'Do this *first.*' },
    fields: [
      eyebrow,
      headline,
      defineField({ name: 'body', title: 'Text', type: 'text', rows: 4 }),
      defineField({ name: 'sub', title: 'Second line (optional)', type: 'text', rows: 2 }),
    ],
    preview: { select: { title: 'headline' }, prepare: (s) => ({ title: `Safety · ${s.title || ''}` }) },
  }),

  defineArrayMember({
    name: 'stepList',
    title: 'Step-by-step list',
    type: 'object',
    description: 'Numbered steps with a bold lead-in, e.g. installation or set-up. The steps light up in order as they scroll in.',
    fields: [
      eyebrow,
      headline,
      intro,
      defineField({
        name: 'steps',
        title: 'Steps',
        type: 'array',
        of: [
          defineArrayMember({
            type: 'object',
            name: 'stepItem',
            fields: [
              defineField({ name: 'lead', title: 'Bold lead-in', type: 'string', validation: (r) => r.required() }),
              defineField({ name: 'body', title: 'Text', type: 'text', rows: 2 }),
            ],
            preview: { select: { title: 'lead', subtitle: 'body' } },
          }),
        ],
      }),
    ],
    preview: { select: { title: 'headline' }, prepare: (s) => ({ title: `Steps · ${s.title || ''}` }) },
  }),

  defineArrayMember({
    name: 'imageMosaic',
    title: 'Photo mosaic (pairs and wide)',
    type: 'object',
    description: 'Photos laid out as pairs with a wide one between them: 2, 1, 2. Add any number; the pattern repeats. A disclosure line sits under them.',
    fields: [
      defineField({
        name: 'images',
        title: 'Photos',
        type: 'array',
        of: [defineArrayMember({ type: 'image', name: 'mosaicImage', options: { hotspot: true }, fields: [altField] })],
      }),
      defineField({ name: 'colour', title: 'Keep the photos in colour', type: 'boolean', initialValue: false, description: 'Off = black and white (mood photos). On = product photography.' }),
      defineField({ name: 'disclosure', title: 'Disclosure line (optional)', type: 'string', description: 'E.g. "AI-generated content. The images were made with artificial intelligence."' }),
    ],
    preview: {
      select: { images: 'images', media: 'images.0' },
      prepare: ({ images, media }: { images?: unknown[]; media?: never }) => ({ title: `Photo mosaic · ${(images || []).length} photos`, media }),
    },
  }),

  defineArrayMember({
    name: 'linkCards',
    title: 'Product cards with links (manual)',
    type: 'object',
    description:
      'Cards with a product photo, a title and one line, each linking to the product at the visitor’s dealer. For products picked by hand with your own words; use "Product cards (by SKU)" to pull them from the product feed instead.',
    fields: [
      eyebrow,
      headline,
      intro,
      defineField({
        name: 'cards',
        title: 'Cards',
        type: 'array',
        of: [
          defineArrayMember({
            type: 'object',
            name: 'linkCard',
            fields: [
              imageField('imageUpload', 'Product photo (cut-out)'),
              defineField({ name: 'badge', title: 'Badge (optional)', type: 'string', description: 'E.g. "New".' }),
              defineField({ name: 'title', title: 'Title', type: 'string', validation: (r) => r.required() }),
              defineField({ name: 'body', title: 'Text', type: 'text', rows: 2 }),
              ...linkFields.filter((f) => f.name !== 'linkLabel'),
            ],
            preview: { select: { title: 'title', subtitle: 'itemNumber', media: 'imageUpload' } },
          }),
        ],
      }),
      defineField({ name: 'secondHeadline', title: 'Second group headline (optional)', type: 'string', description: 'E.g. "...and three brand new". Starts a second row of cards.' }),
      defineField({
        name: 'secondCards',
        title: 'Second group cards',
        type: 'array',
        hidden: ({ parent }) => !(parent as { secondHeadline?: string } | undefined)?.secondHeadline,
        of: [
          defineArrayMember({
            type: 'object',
            name: 'linkCard',
            fields: [
              imageField('imageUpload', 'Product photo (cut-out)'),
              defineField({ name: 'badge', title: 'Badge (optional)', type: 'string' }),
              defineField({ name: 'title', title: 'Title', type: 'string', validation: (r) => r.required() }),
              defineField({ name: 'body', title: 'Text', type: 'text', rows: 2 }),
              ...linkFields.filter((f) => f.name !== 'linkLabel'),
            ],
            preview: { select: { title: 'title', subtitle: 'itemNumber', media: 'imageUpload' } },
          }),
        ],
      }),
      defineField({ name: 'linkLabel', title: 'Link label on every card', type: 'string', description: 'E.g. "See it at your dealer". Empty = an arrow only.' }),
    ],
    preview: { select: { title: 'headline' }, prepare: (s) => ({ title: `Product link cards · ${s.title || ''}` }) },
  }),

  defineArrayMember({
    name: 'explainer',
    title: 'Explainer (levels, colour temperature, notes)',
    type: 'object',
    description:
      'Teach one concept: a headline and intro, then a visual (a scale of levels like lux, or a colour-temperature strip like Kelvin), two short notes side by side, and a button to read more.',
    fields: [
      eyebrow,
      headline,
      intro,
      defineField({
        name: 'visual',
        title: 'Visual',
        type: 'string',
        options: {
          list: [
            { title: 'None', value: 'none' },
            { title: 'Scale of levels (e.g. lux)', value: 'levels' },
            { title: 'Colour temperature strip (Kelvin)', value: 'kelvin' },
          ],
          layout: 'radio',
        },
        initialValue: 'none',
      }),
      defineField({
        name: 'levels',
        title: 'Levels',
        type: 'array',
        hidden: ({ parent }) => (parent as { visual?: string } | undefined)?.visual === 'none',
        description: 'Levels: a value and a line each, lowest first. Kelvin: the temperature, a caption and optional use tags.',
        of: [
          defineArrayMember({
            type: 'object',
            name: 'level',
            fields: [
              defineField({ name: 'value', title: 'Value', type: 'string', description: 'E.g. 25 lux, or 4.000 K.', validation: (r) => r.required() }),
              defineField({ name: 'body', title: 'Text', type: 'text', rows: 2 }),
              defineField({ name: 'kelvin', title: 'Kelvin number (colour strip only)', type: 'number', description: 'E.g. 4000. Sets the colour of the swatch.' }),
              defineField({ name: 'chips', title: 'Use tags (optional)', type: 'array', of: [{ type: 'string' }] }),
            ],
            preview: { select: { title: 'value', subtitle: 'body' } },
          }),
        ],
      }),
      defineField({ name: 'axisLow', title: 'Strip label, left end', type: 'string', hidden: ({ parent }) => (parent as { visual?: string } | undefined)?.visual !== 'kelvin' }),
      defineField({ name: 'axisHigh', title: 'Strip label, right end', type: 'string', hidden: ({ parent }) => (parent as { visual?: string } | undefined)?.visual !== 'kelvin' }),
      defineField({ name: 'note', title: 'Small print above the visual (optional)', type: 'text', rows: 2 }),
      defineField({
        name: 'notes',
        title: 'Notes (two side by side work best)',
        type: 'array',
        of: [
          defineArrayMember({
            type: 'object',
            name: 'explainerNote',
            fields: [
              defineField({ name: 'title', title: 'Title', type: 'string' }),
              defineField({ name: 'body', title: 'Text', type: 'text', rows: 3 }),
            ],
            preview: { select: { title: 'title' } },
          }),
        ],
      }),
      defineField({ name: 'after', title: 'Closing paragraph (optional)', type: 'text', rows: 3 }),
      defineField({ name: 'ctaLabel', title: 'Button label (optional)', type: 'string' }),
      defineField({ name: 'ctaHref', title: 'Button link', type: 'string' }),
    ],
    preview: { select: { title: 'headline', visual: 'visual' }, prepare: (s) => ({ title: `Explainer · ${s.title || ''}`, subtitle: s.visual }) },
  }),

  defineArrayMember({
    name: 'peopleCards',
    title: 'People to call (specialists)',
    type: 'object',
    description: 'Named people with photo, store, role, a short bio and how to reach them. Phone and email become tap-to-call and tap-to-mail links.',
    fields: [
      eyebrow,
      headline,
      intro,
      defineField({
        name: 'people',
        title: 'People',
        type: 'array',
        of: [
          defineArrayMember({
            type: 'object',
            name: 'person',
            fields: [
              defineField({ name: 'name', title: 'Name', type: 'string', validation: (r) => r.required() }),
              defineField({ name: 'role', title: 'Role', type: 'string' }),
              defineField({ name: 'location', title: 'Store / location', type: 'string' }),
              defineField({ name: 'bio', title: 'Short bio', type: 'text', rows: 3 }),
              defineField({ name: 'phone', title: 'Phone', type: 'string' }),
              defineField({ name: 'email', title: 'Email', type: 'string', validation: (r) => r.email() }),
              imageField('photo', 'Photo'),
            ],
            preview: { select: { title: 'name', subtitle: 'location', media: 'photo' } },
          }),
        ],
      }),
    ],
    preview: { select: { title: 'headline' }, prepare: (s) => ({ title: `People · ${s.title || ''}` }) },
  }),
];
