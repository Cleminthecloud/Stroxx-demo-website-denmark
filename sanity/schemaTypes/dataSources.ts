import { defineField, defineType } from 'sanity';

/** Data sources: the systems the site READS FROM but does not own.
 *
 *  PIM (product data), DAM (product imagery) and, one day, a sales signal from
 *  the dealers' own systems. These used to sit as two lonely read-only fields on
 *  the "Technical (developer)" tab of Site settings, where nobody could find
 *  them during a demo. They now have their own place under Settings, with a
 *  status per feed so anyone opening the Studio can see, in one screen, what is
 *  connected, what is being specified and what has not started.
 *
 *  Nothing here reaches out on its own. These fields RECORD the agreed shape of
 *  each integration; the sync itself is code, and it only switches on when the
 *  adapter for that feed ships. Credentials never live here: they live in the
 *  hosting environment. Full contract and the questions for Carl Ras IT:
 *  docs/STROXX-pim-dam-integration.md. */

const STATUS = [
  { title: 'Not started', value: 'none' },
  { title: 'Spec sent to IT', value: 'spec' },
  { title: 'Credentials received, testing', value: 'testing' },
  { title: 'Live', value: 'live' },
];

const statusField = (name: string, title: string, fieldset: string, description: string) =>
  defineField({
    name,
    title,
    type: 'string',
    fieldset,
    description,
    initialValue: 'none',
    options: { list: STATUS, layout: 'radio' },
  });

export const dataSources = defineType({
  name: 'dataSources',
  title: 'Data sources (PIM, DAM, sales)',
  type: 'document',
  fieldsets: [
    {
      name: 'pim',
      title: 'PIM: product data',
      description:
        'Where product facts come from: a STROXX product reference, name, category, specifications, image reference, status. Two things are dropped at the boundary by construction, whatever the feed sends: prices, and the dealer\'s own item numbers (each dealer numbers the same product differently, so showing one dealer\'s number at EU level presents it as if it were universal). Today the catalogue is curated in the codebase; this box records the agreed shape of the live feed.',
      options: { collapsible: true, collapsed: false },
    },
    {
      name: 'dam',
      title: 'DAM: product imagery',
      description:
        'Where product photography comes from. Images already render live from the Carl Ras DAM (Digizuite) via curated asset IDs. This box records the agreed shape of the feed-driven version.',
      options: { collapsible: true, collapsed: false },
    },
    {
      name: 'sales',
      title: 'Sales signal (dealer systems)',
      description:
        'STROXX does not sell online, so the brand holds no order data: every transaction happens in a dealer or partner system. Any sales-based segmentation therefore depends on a dealer agreeing to share a signal. This box records whether that conversation has started and what shape it would take.',
      options: { collapsible: true, collapsed: true },
    },
  ],
  fields: [
    /* ── PIM ── */
    statusField('pimStatus', 'PIM status', 'pim', 'Where this integration stands today. Purely informational: switching this to Live does not connect anything, the adapter does.'),
    defineField({
      name: 'pimSystem',
      title: 'PIM system',
      type: 'string',
      fieldset: 'pim',
      description: 'The product information system the data comes from, e.g. Perfion, inRiver, Struct, or an in-house database.',
    }),
    defineField({
      name: 'pimMode',
      title: 'How the data reaches us',
      type: 'string',
      fieldset: 'pim',
      description: 'The three options put to Carl Ras IT. A feed URL is the least effort for IT; push is the most modern and is usually combined with one of the other two.',
      options: {
        list: [
          { title: 'Feed URL we poll (JSON or CSV at an HTTPS address)', value: 'feed' },
          { title: 'Their REST or GraphQL API we call', value: 'api' },
          { title: 'They push to our webhook when products change', value: 'push' },
        ],
        layout: 'radio',
      },
    }),
    defineField({
      name: 'pimFeedUrl',
      title: 'Feed or API address',
      type: 'url',
      fieldset: 'pim',
      description:
        'The HTTPS address the sync will read. Address only, never a key or token: those go in the hosting environment, never in the CMS. Entering an address here records the agreement, it does not start a sync.',
    }),
    defineField({
      name: 'pimSchedule',
      title: 'How often we sync',
      type: 'string',
      fieldset: 'pim',
      description: 'The site always renders from the last good snapshot, so a feed outage can never blank a page. This only sets how fresh that snapshot is.',
      options: {
        list: [
          { title: 'Hourly', value: 'hourly' },
          { title: 'Every 4 hours', value: '4h' },
          { title: 'Nightly', value: 'nightly' },
          { title: 'On change (push)', value: 'push' },
        ],
      },
    }),
    defineField({
      name: 'pimContact',
      title: 'Who owns it at the dealer',
      type: 'string',
      fieldset: 'pim',
      description: 'Name, role and email of the person on the IT side who owns this feed. The one field that saves the most time later.',
    }),
    defineField({ name: 'pimNotes', title: 'Notes and open questions', type: 'text', rows: 3, fieldset: 'pim' }),

    /* ── DAM ── */
    statusField('damStatus', 'DAM status', 'dam', 'Where this integration stands today. Informational, same as above.'),
    defineField({
      name: 'damSystem',
      title: 'DAM system',
      type: 'string',
      fieldset: 'dam',
      initialValue: 'Digizuite',
      description: 'The digital asset system the imagery comes from.',
    }),
    defineField({
      name: 'damMode',
      title: 'How the images reach us',
      type: 'string',
      fieldset: 'dam',
      options: {
        list: [
          { title: 'We reference renditions on their CDN (today)', value: 'cdn' },
          { title: 'Nightly bulk export of transparent PNGs to our storage', value: 'export' },
          { title: 'We call their DAM API and resolve renditions ourselves', value: 'api' },
        ],
        layout: 'radio',
      },
    }),
    defineField({
      name: 'damBaseUrl',
      title: 'Image base address',
      type: 'url',
      fieldset: 'dam',
      description: 'The base the sync resolves asset IDs against, e.g. https://images.carl-ras.dk. Address only, no credentials.',
    }),
    defineField({
      name: 'damRenditionId',
      title: 'Transparent rendition ID',
      type: 'string',
      fieldset: 'dam',
      description:
        'The dark STROXX design needs a transparent, single-object cut-out per product. This is the rendition format ID that produces it. The one ask that matters most from the DAM side.',
    }),
    defineField({
      name: 'damContact',
      title: 'Who owns it at the dealer',
      type: 'string',
      fieldset: 'dam',
      description: 'Name, role and email of the asset system owner.',
    }),
    defineField({ name: 'damNotes', title: 'Notes and open questions', type: 'text', rows: 3, fieldset: 'dam' }),

    /* ── Sales ── */
    statusField('salesStatus', 'Sales signal status', 'sales', 'Almost always "Not started". Sales data belongs to the dealer, not to the brand.'),
    defineField({
      name: 'salesSource',
      title: 'Which system would supply it',
      type: 'string',
      fieldset: 'sales',
      description: 'e.g. the dealer webshop, their ERP, or an aggregated report. Named here so the conversation has somewhere to land.',
    }),
    defineField({
      name: 'salesNotes',
      title: 'What we would need, and what we would never ask for',
      type: 'text',
      rows: 4,
      fieldset: 'sales',
      description:
        'Realistic scope: an aggregated, non-personal signal such as "this trade bought this category last quarter" is negotiable. Named customer records, order lines and anything with a price in it are not, and would break both the price rule and the data agreement.',
    }),
  ],
  preview: {
    select: { pim: 'pimStatus', dam: 'damStatus' },
    prepare: ({ pim, dam }: { pim?: string; dam?: string }) => {
      const label = (v?: string) => STATUS.find((s) => s.value === (v || 'none'))?.title ?? 'Not started';
      return { title: 'Data sources (PIM, DAM, sales)', subtitle: `PIM: ${label(pim)} · DAM: ${label(dam)}` };
    },
  },
});
