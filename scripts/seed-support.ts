/**
 * Seeds the Support & downloads section with the REAL content the packaging
 * QR codes depend on today (crawled from the legacy stroxx.eu Shopify store,
 * 2026-07-04):
 *
 *   /support/smart-locks-st2      ← QR target, ~390 visits/month
 *   /support/xlock-software-guide ← QR target, ~30 visits/month
 *
 * It downloads each PDF from the old store's Shopify CDN and uploads it into
 * Sanity, so the day the domain moves, nothing depends on cdn.shopify.com
 * anymore. Also seeds one example /qr/ short link for future print runs.
 *
 * Run from the repo root (after `npx sanity login`):
 *   npm run seed:support
 *
 * Idempotent: createOrReplace with fixed _ids. Files are re-uploaded on each
 * run (Sanity dedupes identical files by hash, so no storage bloat).
 */
import { getCliClient } from 'sanity/cli';

const client = getCliClient().withConfig({ apiVersion: '2026-07-01' });

const CDN = 'https://cdn.shopify.com/s/files/1/3051/9300/files';

/* filename → old-store URL (verified live 2026-07-04) */
const FILES: Record<string, string> = {
  'STROXX_XLOCK_Software_guide_EN.pdf': `${CDN}/STROXX_XLOCK_Software_guide_EN.pdf?v=1736501615`,
  'STROXX_XLOCK_Software_guide_DK.pdf': `${CDN}/STROXX_XLOCK_Software_guide_DK.pdf?v=1736501614`,
  'STROXX_XLOCK_Software_guide_NL.pdf': `${CDN}/STROXX_XLOCK_Software_guide_NL.pdf?v=1736501613`,
  'STROXX_XLOCK_Software_guide_DE.pdf': `${CDN}/STROXX_XLOCK_Software_guide_DE.pdf?v=1736501613`,
  'STROXX_XLOCK_Software_guide_FR.pdf': `${CDN}/STROXX_XLOCK_Software_guide_FR.pdf?v=1736501612`,
  'STROXX_XLOCK_Software_guide_ES.pdf': `${CDN}/STROXX_XLOCK_Software_guide_ES.pdf?v=1739283790`,
  '102-112-113_ST-2_SCAND_UI.pdf': `${CDN}/102-112-113_ST-2_SCAND_UI.pdf?v=1737972998`,
  '102-114-115_ST-2_EURO_UI.pdf': `${CDN}/102-114-115_ST-2_EURO_UI.pdf?v=1737972999`,
  'XLOCK-2024-STROXX-ADK-Model-ST-2-A4.pdf': `${CDN}/XLOCK-2024-Sikring-STROXX-ADK-Model-ST-2-A4.pdf?v=1723734756`,
};

async function uploadAll(): Promise<Record<string, string>> {
  const ids: Record<string, string> = {};
  for (const [name, url] of Object.entries(FILES)) {
    process.stdout.write(`  ${name} … `);
    const res = await fetch(url);
    if (!res.ok) {
      console.log(`SKIPPED (HTTP ${res.status}) — upload manually in the Studio`);
      continue;
    }
    const buf = Buffer.from(await res.arrayBuffer());
    const asset = await client.assets.upload('file', buf, { filename: name, contentType: 'application/pdf' });
    ids[name] = asset._id;
    console.log(`ok (${(buf.length / 1048576).toFixed(1)} MB)`);
  }
  return ids;
}

const fileRef = (ids: Record<string, string>, name: string) =>
  ids[name] ? { _type: 'file', asset: { _type: 'reference', _ref: ids[name] } } : undefined;

const item = (key: string, label: string, file?: unknown, note?: string) => ({
  _type: 'downloadItem',
  _key: key,
  label,
  ...(file ? { file } : {}),
  ...(note ? { note } : {}),
});

const group = (key: string, heading: string, items: unknown[]) => ({
  _type: 'downloadGroup',
  _key: key,
  heading,
  items,
});

async function run() {
  console.log('Uploading PDFs from the legacy store CDN into Sanity…');
  const ids = await uploadAll();

  const st2 = {
    _id: 'support-smart-locks-st2',
    _type: 'supportPage',
    title: 'ST-2 Smart Lock',
    slug: { current: 'smart-locks-st2' }, // EXACT legacy slug: packaging QR codes point here
    intro: 'User instructions, software guides and the product flyer for the ST-2 Smart Lock, in your language.',
    seoTitle: 'ST-2 Smart Lock manuals & software guide · STROXX',
    seoDescription: 'Download the ST-2 Smart Lock user instruction and software guide in English, Danish, Dutch, German or French.',
    groups: [
      group('en', 'English', [
        item('en-sw', 'Software guide', fileRef(ids, 'STROXX_XLOCK_Software_guide_EN.pdf')),
        item('en-ui-sc', 'User instruction, Scandinavian (pages 4-7)', fileRef(ids, '102-112-113_ST-2_SCAND_UI.pdf'), '102-112-113'),
        item('en-ui-eu', 'User instruction, European (pages 4-7)', fileRef(ids, '102-114-115_ST-2_EURO_UI.pdf'), '102-114-115'),
      ]),
      group('dk', 'Dansk', [
        item('dk-fl', 'Flyer/brochure om ST-2 Smart Lock', fileRef(ids, 'XLOCK-2024-STROXX-ADK-Model-ST-2-A4.pdf')),
        item('dk-sw', 'Software guide', fileRef(ids, 'STROXX_XLOCK_Software_guide_DK.pdf')),
        item('dk-ui-sc', 'Brugeranvisning, skandinavisk (side 8-11)', fileRef(ids, '102-112-113_ST-2_SCAND_UI.pdf'), '102-112-113'),
        item('dk-ui-eu', 'Brugeranvisning, europæisk (side 8-11)', fileRef(ids, '102-114-115_ST-2_EURO_UI.pdf'), '102-114-115'),
      ]),
      group('nl', 'Nederlands', [
        item('nl-sw', 'Softwaregids', fileRef(ids, 'STROXX_XLOCK_Software_guide_NL.pdf')),
        item('nl-ui-sc', 'Gebruikersinstructie, Scandinavisch (pagina 12-15)', fileRef(ids, '102-112-113_ST-2_SCAND_UI.pdf'), '102-112-113'),
        item('nl-ui-eu', 'Gebruikersinstructie, Europees (pagina 12-15)', fileRef(ids, '102-114-115_ST-2_EURO_UI.pdf'), '102-114-115'),
      ]),
      group('de', 'Deutsch', [
        item('de-sw', 'Software-Anleitung', fileRef(ids, 'STROXX_XLOCK_Software_guide_DE.pdf')),
        item('de-ui-sc', 'Gebrauchsanleitung, Skandinavien (Seite 16-19)', fileRef(ids, '102-112-113_ST-2_SCAND_UI.pdf'), '102-112-113'),
        item('de-ui-eu', 'Gebrauchsanleitung, Europäisch (Seite 16-19)', fileRef(ids, '102-114-115_ST-2_EURO_UI.pdf'), '102-114-115'),
      ]),
      group('fr', 'Français', [
        item('fr-sw', 'Guide logiciel', fileRef(ids, 'STROXX_XLOCK_Software_guide_FR.pdf')),
        item('fr-ui-sc', "Instructions d'utilisation, scandinave (pages 20-23)", fileRef(ids, '102-112-113_ST-2_SCAND_UI.pdf'), '102-112-113'),
        item('fr-ui-eu', "Instructions d'utilisation, européen (pages 20-23)", fileRef(ids, '102-114-115_ST-2_EURO_UI.pdf'), '102-114-115'),
      ]),
    ],
  };

  const xlock = {
    _id: 'support-xlock-software-guide',
    _type: 'supportPage',
    title: 'XLOCK software guide',
    slug: { current: 'xlock-software-guide' }, // EXACT legacy slug: packaging QR codes point here
    intro: 'Download the XLOCK software guide to set up your Smart Lock, in six languages.',
    seoTitle: 'XLOCK software guide · STROXX',
    seoDescription: 'Download the STROXX XLOCK Smart Lock software guide in English, Danish, Dutch, German, French or Spanish.',
    groups: [
      group('all', 'All languages', [
        item('en', 'Software guide · English', fileRef(ids, 'STROXX_XLOCK_Software_guide_EN.pdf')),
        item('dk', 'Software guide · Dansk', fileRef(ids, 'STROXX_XLOCK_Software_guide_DK.pdf')),
        item('nl', 'Softwaregids · Nederlands', fileRef(ids, 'STROXX_XLOCK_Software_guide_NL.pdf')),
        item('de', 'Software-Anleitung · Deutsch', fileRef(ids, 'STROXX_XLOCK_Software_guide_DE.pdf')),
        item('fr', 'Guide logiciel · Français', fileRef(ids, 'STROXX_XLOCK_Software_guide_FR.pdf')),
        item('es', 'Guía de software · Español', fileRef(ids, 'STROXX_XLOCK_Software_guide_ES.pdf')),
      ]),
    ],
  };

  /* one managed short link as the working example for future print runs */
  const qrSt2 = {
    _id: 'qr-st2',
    _type: 'qrCode',
    code: { current: 'st2' },
    label: 'ST-2 support (example for future print)',
    target: '/support/smart-locks-st2',
    active: true,
  };

  console.log('Writing documents…');
  await client
    .transaction()
    .createOrReplace(st2)
    .createOrReplace(xlock)
    .createOrReplace(qrSt2)
    .commit();

  console.log('Done. Check /support, /support/smart-locks-st2 and /qr/st2');
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
