/**
 * Publishes rendered STROXX guides (docs/guides/output/<id>.pdf) to the site.
 *
 * For every product line folder in docs/guides/<line>/ it:
 *   1. uploads each rendered PDF as a Sanity file asset (deduped by hash),
 *   2. createOrReplace's ONE Danish support page per line
 *      (_id support-<line>-help-da, slug <line>-help, language da-DK)
 *      -> live at stroxx.eu/dk/support/<line>-help,
 *   3. ensures a managed QR code /qr/<line>-help pointing at that page
 *      (repointable without reprinting; never rename a printed code).
 *
 * Each download carries its STROXX item numbers in `note`, which is also what
 * the PIM feed matches on later.
 *
 * Run from the repo root after `npx sanity login`:
 *   npm run guides:publish
 *
 * Idempotent: fixed _ids, re-running only refreshes files and labels.
 */
import { getCliClient } from 'sanity/cli';
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';

const client = getCliClient().withConfig({ apiVersion: '2026-07-01' });

const ROOT = 'docs/guides';
const OUT = join(ROOT, 'output');

/** Page copy per product line. Add a line here when a new product family gets guides. */
const LINES: Record<string, { title: string; intro: string; heading: string }> = {
  xlock: {
    title: 'XLOCK hjælp og vejledninger',
    intro: 'Trin-for-trin vejledninger til STROXX XLOCK smart locks, gateways og XLOCK-appen.',
    heading: 'Vejledninger',
  },
};

type Guide = { id: string; title: string; summary?: string; applies_to?: { name: string; item_no?: string }[] };

async function run() {
  const lines = readdirSync(ROOT).filter((d) => LINES[d] && statSync(join(ROOT, d)).isDirectory());
  for (const line of lines) {
    const cfg = LINES[line];
    const guides: Guide[] = readdirSync(join(ROOT, line))
      .map((d) => join(ROOT, line, d, 'guide.json'))
      .filter(existsSync)
      .map((p) => JSON.parse(readFileSync(p, 'utf8')));

    const items = [];
    for (const g of guides) {
      const pdf = join(OUT, `${g.id}.pdf`);
      if (!existsSync(pdf)) {
        console.log(`  ${g.id}: no rendered PDF, skipped (run render.py first)`);
        continue;
      }
      const asset = await client.assets.upload('file', readFileSync(pdf), {
        filename: `STROXX-${g.id}.pdf`,
        contentType: 'application/pdf',
      });
      const itemNos = (g.applies_to ?? []).map((a) => a.item_no).filter(Boolean).join(', ');
      items.push({
        _type: 'downloadItem',
        _key: g.id.replace(/[^a-z0-9]/gi, '').slice(0, 30),
        label: g.title,
        file: { _type: 'file', asset: { _type: 'reference', _ref: asset._id } },
        language: 'da',
        ...(itemNos ? { note: itemNos } : {}),
      });
      console.log(`  ${g.id}: uploaded`);
    }

    const slug = `${line}-help`;
    const page = {
      _id: `support-${line}-help-da`,
      _type: 'supportPage',
      language: 'da-DK',
      title: cfg.title,
      slug: { _type: 'slug', current: slug },
      intro: cfg.intro,
      groups: [{ _type: 'downloadGroup', _key: 'guides', heading: cfg.heading, items }],
      seoTitle: `${cfg.title} · STROXX`,
      seoDescription: cfg.intro,
    };
    const qr = {
      _id: `qr-${slug}`,
      _type: 'qrCode',
      code: { _type: 'slug', current: slug },
      label: `${cfg.title} · guide QR`,
      target: `/dk/support/${slug}`,
      active: true,
    };
    await client.transaction().createOrReplace(page).createOrReplace(qr).commit();
    console.log(`Done: /dk/support/${slug} (${items.length} guides), QR /qr/${slug}`);
  }
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
