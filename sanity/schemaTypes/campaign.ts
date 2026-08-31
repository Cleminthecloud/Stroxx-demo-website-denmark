import { defineArrayMember, defineField, defineType } from 'sanity';
import { markets } from '../../lib/markets';
import { langLabel } from '../lib/langLabel';
import { windowState } from '../../lib/campaigns';

/** Campaign — the creative once, the schedule per market.
 *
 *  A campaign document holds one campaign's words and photos. Underneath, the
 *  "Where and when it runs" table has one row per market: each country switches
 *  its own row on or off, sets its own start and finish dates, chooses where it
 *  shows on the front page and in what order. The same EU campaign can be live
 *  in Denmark, scheduled in Germany and off in France, and a country can build
 *  a campaign of its own that only ever carries its own row.
 *
 *  Several campaigns may be live in the same market at the same time: the
 *  homepage band rotates through the ones set to "Big photo band", the rest sit
 *  in the slim promo row. See lib/campaigns.ts for the window logic. */

const MARKET_OPTIONS = markets.map((m) => ({ title: `${m.name} (${m.code})`, value: m.code as string }));

const PLACEMENTS = [
  { title: 'Big photo band on the front page', value: 'band' },
  { title: 'Slim promo row on the front page', value: 'strip' },
  { title: 'Campaign page only (no front-page slot)', value: 'page' },
];

export const campaign = defineType({
  name: 'campaign',
  title: 'Campaign',
  type: 'document',
  groups: [
    { name: 'schedule', title: 'Where and when', default: true },
    { name: 'creative', title: 'Words and photos' },
  ],
  fields: [
    defineField({ name: 'language', type: 'string', readOnly: true, hidden: true }),
    defineField({
      name: 'name',
      title: 'Campaign name',
      type: 'string',
      group: 'schedule',
      description: 'Internal name, e.g. "Autumn 2026" or "DK winter tools". Only your team sees it.',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'origin',
      title: 'Who owns this campaign',
      type: 'string',
      group: 'schedule',
      description:
        'A shared EU campaign is offered to every country and each one decides whether to run it. A country campaign is that market’s own idea. This only labels the campaign in the lists, it never blocks anyone.',
      options: {
        list: [{ title: 'Shared EU campaign', value: 'eu' }, ...MARKET_OPTIONS.map((m) => ({ title: `${m.title} campaign`, value: m.value }))],
      },
      initialValue: 'eu',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'activations',
      title: 'Where and when it runs',
      type: 'array',
      group: 'schedule',
      description:
        'One row per country. Add a row for your own market, switch it on, and set the dates. No row, or the switch off, means the campaign does not show in that country at all.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'activation',
          initialValue: { active: false, placement: 'band', order: 1 },
          fields: [
            defineField({
              name: 'market',
              title: 'Country',
              type: 'string',
              options: { list: MARKET_OPTIONS },
              validation: (r) => r.required(),
            }),
            defineField({
              name: 'active',
              title: 'Switched on',
              type: 'boolean',
              description: 'Off = the campaign never shows in this country, whatever the dates say.',
              initialValue: false,
            }),
            defineField({
              name: 'startDate',
              title: 'Starts',
              type: 'date',
              options: { dateFormat: 'YYYY-MM-DD' },
              description: 'First day it shows. Empty = as soon as it is switched on.',
            }),
            defineField({
              name: 'endDate',
              title: 'Finishes',
              type: 'date',
              options: { dateFormat: 'YYYY-MM-DD' },
              description: 'Last day it shows, that whole day included. Empty = runs until someone switches it off.',
            }),
            defineField({
              name: 'placement',
              title: 'Front-page slot',
              type: 'string',
              options: { list: PLACEMENTS, layout: 'radio' },
              initialValue: 'band',
              description:
                'The big band is the cinematic photo section. When several campaigns share the band it rotates through them, so a second campaign does not push the first one off the page.',
            }),
            defineField({
              name: 'order',
              title: 'Running order',
              type: 'number',
              initialValue: 1,
              description: '1 shows first. Only matters when this country has more than one campaign live at once.',
              validation: (r) => r.min(1).max(99),
            }),
          ],
          preview: {
            select: { market: 'market', active: 'active', startDate: 'startDate', endDate: 'endDate', placement: 'placement' },
            prepare: (s: Record<string, unknown>) => {
              const code = (s.market as string) || '';
              const name = markets.find((m) => m.code === code)?.name || code || 'No country';
              const state = windowState({
                active: s.active as boolean,
                startDate: s.startDate as string,
                endDate: s.endDate as string,
              });
              const badge = { live: '● Live now', scheduled: '◷ Scheduled', ended: '✓ Ended', off: '○ Switched off' }[state];
              const span = [s.startDate, s.endDate].filter(Boolean).join(' → ') || 'no dates set';
              const slot = PLACEMENTS.find((p) => p.value === s.placement)?.title ?? '';
              return { title: `${name} · ${badge}`, subtitle: `${span} · ${slot}` };
            },
          },
        }),
      ],
      validation: (r) =>
        r.custom((rows: { market?: string }[] | undefined) => {
          const codes = (rows ?? []).map((row) => row?.market).filter(Boolean);
          const dupe = codes.find((c, i) => codes.indexOf(c) !== i);
          return dupe ? `${dupe} appears twice. Give each country one row.` : true;
        }),
    }),

    /* ── the creative ──────────────────────────────────────────────────── */
    defineField({
      name: 'eyebrow',
      title: 'Eyebrow label',
      type: 'string',
      group: 'creative',
      description: 'The small uppercase label above the headline.',
      initialValue: 'Campaign',
    }),
    defineField({
      name: 'headline',
      title: 'Headline',
      type: 'text',
      rows: 2,
      group: 'creative',
      description: 'Wrap a word in *asterisks* for the blue accent. Press Enter for a line break.',
    }),
    defineField({ name: 'text', title: 'Body text', type: 'text', rows: 4, group: 'creative' }),
    defineField({
      name: 'images',
      title: 'Campaign photos',
      type: 'array',
      group: 'creative',
      of: [defineArrayMember({ type: 'image', options: { hotspot: true } })],
      description: 'The photos that cross-fade behind the text. Three works well. Empty = the built-in campaign shots.',
      validation: (r) => r.max(6),
    }),
    defineField({
      name: 'primaryLabel',
      title: 'Primary button label',
      type: 'string',
      group: 'creative',
      description:
        'Optional override. Empty = automatic: “Buy at <dealer>” in a dealer country, “Where to buy” internationally. Keep a shared EU campaign dealer-neutral, it renders on the international site too.',
    }),
    defineField({ name: 'secondaryLabel', title: '“Read more” button label', type: 'string', group: 'creative', initialValue: 'Read more' }),
    defineField({
      name: 'link',
      title: '“Read more” → campaign page',
      type: 'reference',
      to: [{ type: 'landingPage' }],
      group: 'creative',
      description: 'The landing page this campaign links to (they publish at /campaign/…). Empty = links to the Try-it page.',
    }),
  ],
  orderings: [
    { name: 'nameAsc', title: 'Name', by: [{ field: 'name', direction: 'asc' }] },
    { name: 'originAsc', title: 'Owner', by: [{ field: 'origin', direction: 'asc' }, { field: 'name', direction: 'asc' }] },
  ],
  preview: {
    select: { name: 'name', origin: 'origin', language: 'language', activations: 'activations' },
    prepare: (s: Record<string, unknown>) => {
      const rows = (s.activations as { market?: string; active?: boolean; startDate?: string; endDate?: string }[]) ?? [];
      const live = rows.filter((r) => windowState(r) === 'live').map((r) => r.market);
      const scheduled = rows.filter((r) => windowState(r) === 'scheduled').map((r) => r.market);
      const owner = s.origin === 'eu' ? 'Shared EU' : markets.find((m) => m.code === s.origin)?.name || 'Campaign';
      const parts = [
        live.length ? `● Live: ${live.join(', ')}` : '',
        scheduled.length ? `◷ Scheduled: ${scheduled.join(', ')}` : '',
        !live.length && !scheduled.length ? 'Not running anywhere' : '',
      ].filter(Boolean);
      return {
        title: (s.name as string) || 'Campaign',
        subtitle: `${owner} · ${langLabel(s.language as string)} · ${parts.join(' · ')}`,
      };
    },
  },
});
