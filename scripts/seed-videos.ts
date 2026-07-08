/**
 * Seeds the MMEXO videos Meena delivered (2026-07-08) into Sanity and wires
 * the packaging QR codes that depend on them.
 *
 * WHY Sanity and not /public: the promo files are ~117 MB each; GitHub rejects
 * files over 100 MB without LFS, and shipping ~600 MB through every Vercel
 * deploy is untenable. Videos live as Sanity file assets, exactly like the
 * support PDFs (see seed-support.ts), so editors swap a clip in the Studio
 * with no redeploy, and the QR targets can be repointed without reprinting.
 *
 * It reads the mp4 masters from a LOCAL folder (they are never committed),
 * uploads each as a file asset, builds the /support/mmexo page grouped by
 * language, and creates a `redirect` document for every legacy MMEXO QR
 * short-path so printed codes keep resolving after the domain cutover.
 *
 * Run from the repo root (after `npx sanity login`), with the mp4s present:
 *   npm run seed:videos                 # reads ./Meena videos
 *   VIDEOS_DIR="/path/to/mp4s" npm run seed:videos
 *
 * Idempotent: createOrReplace with fixed _ids. Files are re-uploaded on each
 * run (Sanity dedupes identical files by hash, so no storage bloat).
 */
import { getCliClient } from 'sanity/cli';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const client = getCliClient().withConfig({ apiVersion: '2026-07-01' });

const DIR = process.env.VIDEOS_DIR || 'Meena videos';

/* logical key → master filename in DIR */
const VIDEOS: Record<string, string> = {
  dk_instr: 'DK_instruction_MMEXO.mp4',
  de_instr: 'DE_Anleitung_MMEXO.mp4',
  nl_instr: 'NL_instruktion_MMEXO.mp4',
  fr_instr: 'FR_instruction_MMEXO.mp4',
  dk_promo: 'DK_MMEXO_promo.mp4',
  de_promo: 'DE_MMEXO_promo.mp4',
  nl_promo: 'NL_MMEXO_promo.mp4',
  fr_promo: 'FR_MMEXO_promo.mp4',
};

async function uploadAll(): Promise<Record<string, string>> {
  const ids: Record<string, string> = {};
  for (const [key, name] of Object.entries(VIDEOS)) {
    const path = join(DIR, name);
    if (!existsSync(path)) {
      console.log(`  ${name} … MISSING in "${DIR}", skipped, upload it in the Studio`);
      continue;
    }
    const buf = readFileSync(path);
    process.stdout.write(`  ${name} (${(buf.length / 1048576).toFixed(0)} MB) … `);
    const asset = await client.assets.upload('file', buf, { filename: name, contentType: 'video/mp4' });
    ids[key] = asset._id;
    console.log('ok');
  }
  return ids;
}

const videoRef = (ids: Record<string, string>, key: string) =>
  ids[key] ? { _type: 'file', asset: { _type: 'reference', _ref: ids[key] } } : undefined;

const item = (key: string, label: string, video?: unknown, note?: string, language?: string) => ({
  _type: 'downloadItem',
  _key: key,
  label,
  ...(video ? { video } : {}),
  ...(note ? { note } : {}),
  ...(language ? { language } : {}),
});

const group = (key: string, heading: string, items: unknown[]) => ({
  _type: 'downloadGroup',
  _key: key,
  heading,
  items,
});

/* Legacy QR short-path → new target. These were intentionally excluded from
 * seed-support.ts ("pending a hosting decision"); the decision is Sanity, so
 * they are wired here. ST-2 lock tutorial videos are NOT included: Meena
 * confirmed (2026-07-08) they were never produced. */
const REDIRECTS: [from: string, to: string][] = [
  ['/mmexo-skeleton-dk-video', '/support/mmexo'],
  ['/mmexo-skeleton-de-video', '/support/mmexo'],
  ['/mmexo-skeleton-nl-video', '/support/mmexo'],
  ['/mmexo-skeleton-fr-video', '/support/mmexo'],
];

async function run() {
  console.log(`Uploading MMEXO videos from "${DIR}" into Sanity…`);
  const ids = await uploadAll();

  const mmexo = {
    _id: 'support-mmexo',
    _type: 'supportPage',
    title: 'MMEXO exoskeleton',
    slug: { current: 'mmexo' },
    intro: 'Instruction clips and product films for the STROXX MMEXO exoskeleton, in your language.',
    seoTitle: 'MMEXO exoskeleton videos · STROXX',
    seoDescription: 'Watch the STROXX MMEXO instruction video and product film in Danish, German, Dutch or French.',
    groups: [
      group('dk', 'Dansk', [
        item('dk-instr', 'Instruktionsvideo', videoRef(ids, 'dk_instr'), 'Sådan bruger du MMEXO', 'da'),
        item('dk-promo', 'Produktfilm', videoRef(ids, 'dk_promo'), undefined, 'da'),
      ]),
      group('de', 'Deutsch', [
        item('de-instr', 'Anleitungsvideo', videoRef(ids, 'de_instr'), 'So verwenden Sie MMEXO', 'de'),
        item('de-promo', 'Produktfilm', videoRef(ids, 'de_promo'), undefined, 'de'),
      ]),
      group('nl', 'Nederlands', [
        item('nl-instr', 'Instructievideo', videoRef(ids, 'nl_instr'), 'Zo gebruik je MMEXO', 'nl'),
        item('nl-promo', 'Productfilm', videoRef(ids, 'nl_promo'), undefined, 'nl'),
      ]),
      group('fr', 'Français', [
        item('fr-instr', 'Vidéo d’instructions', videoRef(ids, 'fr_instr'), 'Comment utiliser MMEXO', 'fr'),
        item('fr-promo', 'Film produit', videoRef(ids, 'fr_promo'), undefined, 'fr'),
      ]),
    ],
  };

  /* one managed short link as the working example for future print runs */
  const qrMmexo = {
    _id: 'qr-mmexo',
    _type: 'qrCode',
    code: { current: 'mmexo' },
    label: 'MMEXO videos (example for future print)',
    target: '/support/mmexo',
    active: true,
  };

  const redirectDocs = REDIRECTS.map(([from, to]) => ({
    _id: `redirect-legacy-${from.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '')}`,
    _type: 'redirect',
    from,
    to,
    permanent: true,
  }));

  console.log('Writing documents…');
  let tx = client.transaction().createOrReplace(mmexo).createOrReplace(qrMmexo);
  for (const doc of redirectDocs) tx = tx.createOrReplace(doc);
  await tx.commit();

  console.log(`Done. MMEXO support page + qr/mmexo + ${redirectDocs.length} legacy redirects written.`);
  console.log('Check /support/mmexo and /qr/mmexo');
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
