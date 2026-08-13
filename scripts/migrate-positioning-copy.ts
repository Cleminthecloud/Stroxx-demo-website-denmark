/**
 * One-time (but idempotent) migration: replaces cheap-positioning copy across
 * the CMS. Covers the homePage campaign band, three trade page titles, and one
 * testimonial.
 *
 * WHY: the Dubletstrategi deck (Carl Ras, Aug 2026) puts STROXX at price index
 * 80 to 90 against category leaders, with Basixx at index 70 owning the low end.
 * The old campaign copy ("It just does not cost nearly as much") sells STROXX at
 * roughly index 50 and does Basixx's job. See
 * docs/STROXX-duplicate-strategy-implications.md and
 * docs/STROXX-positioning-change-plan.md (P0.3).
 *
 * Changing the code defaults is NOT enough: lib/home-copy.ts, lib/trades.ts and
 * lib/testimonials.ts are fallbacks for empty CMS fields only, and the live
 * documents have the old strings actually set, so the site would keep rendering
 * them. This script updates the documents. (lib/llms-fallback.ts needs no
 * migration: siteSettings.llmsTxt is empty, so it already falls through to the
 * code.)
 *
 * SAFE BY DESIGN: only patches a field when it still holds the exact old string.
 * Any field an editor has since rewritten is left alone and reported. Runs
 * across every language variant of homePage. Safe to run repeatedly, and a
 * second run reports "already migrated" rather than writing again.
 *
 * Run from the repo root (after `npx sanity login`):
 *   npm run migrate:positioning
 *
 * Verify afterwards in the Studio (Home page, then the Campaign fieldset), and
 * on the homepage campaign band.
 */
import { getCliClient } from 'sanity/cli';

const client = getCliClient().withConfig({ apiVersion: '2026-07-01' });

/** One group per document type: which field carries the copy, and every
 *  [exact old value, new value] pair we are willing to replace in it. */
type Group = {
  type: string;
  /** the fields we read and may patch */
  fields: string[];
  /** field -> list of [old, new] pairs. A field may have several because the
   *  same field on different documents holds different strings (trade titles). */
  replacements: Record<string, [string, string][]>;
};

const GROUPS: Group[] = [
  {
    type: 'homePage',
    fields: ['campaignHeadline', 'campaignText'],
    replacements: {
      campaignHeadline: [
        ['Now you can afford\nmore than just tools', 'Take it to work.\n*Then* decide.'],
      ],
      campaignText: [
        [
          'STROXX is exactly like your pricey tools and good gear. It just does not cost nearly as much. And if you think that sounds too good to be true, we simply say: *TRY IT.* Not for you, or not happy? You get your money back. Simple as that.',
          'STROXX is built for people who use their tools all day and judge them accordingly. So do not take our word for it. Put it to work: *TRY IT.* Not for you, or not happy? You get your money back. Simple as that.',
        ],
      ],
    },
  },
  {
    type: 'trade',
    fields: ['title'],
    replacements: {
      title: [
        ['Power on the job. *Not on the price.*', 'Power on the job. *Where it counts.*'],
        ['Tight work. *Tight prices.*', 'Tight work. *Tight tolerances.*'],
        ['Hard ground. *Soft price.*', 'Hard ground. *Harder tools.*'],
      ],
    },
  },
  {
    /* The site-wide search snippet. Highest-visibility string on the site: it is
       the Google result, the social share card and the browser tab description
       on EVERY page, and it was still selling on costing less. */
    type: 'siteSettings',
    fields: ['seoDescription'],
    replacements: {
      seoDescription: [
        [
          'STROXX is exactly like all your expensive tools and good gear. It just does not cost nearly as much. Real value for money.',
          'Professional tools, specified with the trades across Europe and backed by a 30-day satisfaction guarantee. Put them to work, then decide.',
        ],
      ],
    },
  },
  {
    type: 'testimonial',
    fields: ['quote'],
    replacements: {
      quote: [
        [
          'A line laser at that price sounded too good to be true. It stays razor sharp, even in daylight.',
          'I did not expect this much from a laser I had not heard of. It stays razor sharp, even in daylight.',
        ],
      ],
    },
  },
];

type Doc = Record<string, unknown> & { _id: string; language?: string };

async function runGroup(group: Group, report: string[]): Promise<number> {
  const docs = (await client.fetch(
    `*[_type == "${group.type}"]{ _id, language, ${group.fields.join(', ')} }`
  )) as Doc[];

  if (!docs.length) {
    report.push(`${group.type}: no documents found, nothing to migrate`);
    return 0;
  }

  let tx = client.transaction();
  let writes = 0;

  for (const doc of docs) {
    const label = `${doc._id} (${doc.language ?? 'no language, English base'})`;
    const patch: Record<string, string> = {};
    const skipped: string[] = [];

    for (const field of group.fields) {
      const pairs = group.replacements[field] ?? [];
      const current = doc[field];
      const hit = pairs.find(([oldValue]) => current === oldValue);
      const already = pairs.find(([, newValue]) => current === newValue);
      const oldValue = hit?.[0];
      const newValue = hit?.[1];

      if (hit && oldValue !== undefined && newValue !== undefined) {
        patch[field] = newValue;
      } else if (already) {
        skipped.push(`${field}: already migrated`);
      } else if (current === undefined || current === null || current === '') {
        /* Empty means the document falls through to the code default, which is
           already the new copy. Nothing to do. */
        skipped.push(`${field}: empty, falls through to the new code default`);
      } else {
        /* Either an editor rewrote it, or it was never one of the strings we
           target (most trade titles are fine). Never clobber either. */
        skipped.push(`${field}: not a targeted string, left untouched`);
      }
    }

    if (Object.keys(patch).length) {
      tx = tx.patch(doc._id, (p) => p.set(patch));
      writes += 1;
      report.push(`${label}: replacing ${Object.keys(patch).join(', ')}`);
    }
    for (const s of skipped) report.push(`${label}: ${s}`);
  }

  if (writes) await tx.commit();
  return writes;
}

async function run() {
  const report: string[] = [];
  let writes = 0;

  for (const group of GROUPS) {
    report.push(`\n--- ${group.type} ---`);
    writes += await runGroup(group, report);
  }

  for (const line of report) console.log(line);
  console.log(
    writes
      ? `\nDone. Patched ${writes} document${writes === 1 ? '' : 's'}. Verify in the Studio (Home page Campaign fieldset, Trades, Testimonials) and on the live pages.`
      : '\nNothing to write. Every targeted document is already on the new copy.'
  );
  console.log(
    'Reminder: this only covers the strings we knew about. Anything an editor writes later is their own, see docs/STROXX-positioning-change-plan.md for the rule (STROXX sits at index 80 to 90, it never sells on being cheap).'
  );
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
