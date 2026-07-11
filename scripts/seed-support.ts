/**
 * Seeds the Support & downloads section with the REAL content the packaging
 * QR codes depend on today (crawled + admin-audited from the legacy stroxx.eu
 * Shopify store, 2026-07-04 / expanded 2026-07-06).
 *
 * It downloads every manual/declaration/guide PDF from the old store's Shopify
 * CDN and uploads them into Sanity, builds the support pages that group them,
 * and creates a `redirect` document for every legacy QR short-path so that when
 * the domain moves, seven years of printed codes keep resolving and nothing
 * depends on cdn.shopify.com anymore.
 *
 * Run from the repo root (after `npx sanity login`):
 *   npm run seed:support
 *
 * Idempotent: createOrReplace with fixed _ids. Files are re-uploaded on each
 * run (Sanity dedupes identical files by hash, so no storage bloat).
 *
 * Legacy inventory this mirrors: docs/STROXX-legacy-redirects.csv (32 QR
 * short-paths) and docs/STROXX-legacy-files-manifest.md (~40 PDFs). MMEXO
 * videos are wired separately by scripts/seed-videos.ts (Sanity-hosted, at
 * /support/mmexo); ST-2 lock tutorials were never produced (Meena, 2026-07-08).
 */
import { getCliClient } from 'sanity/cli';

const client = getCliClient().withConfig({ apiVersion: '2026-07-01' });

const CDN = 'https://cdn.shopify.com/s/files/1/3051/9300/files';

/* filename → old-store URL. Base URLs (no ?v cache-buster) verified live
 * 2026-07-06; the version param is optional and the bare path resolves. */
const NAMES = [
  // XLOCK software guides (current, 6 languages)
  'STROXX_XLOCK_Software_guide_EN.pdf', 'STROXX_XLOCK_Software_guide_DK.pdf',
  'STROXX_XLOCK_Software_guide_NL.pdf', 'STROXX_XLOCK_Software_guide_DE.pdf',
  'STROXX_XLOCK_Software_guide_FR.pdf', 'STROXX_XLOCK_Software_guide_ES.pdf',
  // XLOCK software guides (older 2024 versions, kept for reference)
  'XLOCK-Software-guide-EN.pdf', 'XLOCK-Software-guide-DA.pdf',
  // ST-2 smart lock + cylinder range
  '102-112-113_ST-2_SCAND_UI.pdf', '102-114-115_ST-2_EURO_UI.pdf',
  '102-314_ST-10_OVAL_Cylinder_SS_UI.pdf', '102-315_ST-11_E_Cylinder_Mailbox_UI.pdf',
  '102-316_ST-12_E_Cylinder_DOUBLE_EURO_UI.pdf', '102-317_ST-13_E_Padlock_UI.pdf',
  '102-318_ST-14_E_Cylinder_Single_UI.pdf', '102-755_Wireless_Keypad_UI.pdf',
  '101-157_Padlock_manual_ENKELT.pdf',
  // Work light 102-195 (5 languages)
  '102-195_Work_Light_4x_14.000L_APP_EN_UI.pdf', '102-195_Work_Light_4x_14.000L_APP_DK_UI.pdf',
  '102-195_Work_Light_4x_14.000L_APP_DE_UI.pdf', '102-195_Work_Light_4x_14.000L_APP_FR_UI.pdf',
  '102-195_Work_Light_4x_14.000L_APP_NL_UI.pdf',
  // Personal protective equipment + CE declarations
  '101-677-EAR-MUFFS-CE.pdf', '101-676-EARPLUGS-CE.pdf', '101-671-675-RHINO-Glove-CE.pdf',
  '101-657-661-LYNX-Glove-CE.pdf', '101-662-666-LYNX-Glove-2ND-CE.pdf',
  '101-679-X-Protect-Safety-Glasses-CE.pdf', '101-681-689-X-Cross-Shoe-Stroxx.pdf',
  '100-572_DeclarationOfConformity.pdf', '100-573_DeclarationOfConformity.pdf',
  '100-572-573_FFP2_3-V_UI_2023.pdf', '144420700oe.pdf',
  // Other product manuals + datasheets
  '101-156_Key_Storage_Box_manual_WEB.pdf', '101-156_Key_Storage_Box_APP_maual_WEB.pdf',
  '101-156_Key_Storage_Box_maual_App.pdf', '101-258_Mini_Inspection_light_manual_WEB.pdf',
  '101-257_Flashlight_zoom_manual_WEB.pdf', '101-284_ECO_Fire_ex_spray_datasheet.pdf',
  '101-265_FastFix_25-50mm_manual.pdf', '100-411_Power_bank_manual_web.pdf',
];

const FILES: Record<string, string> = Object.fromEntries(NAMES.map((n) => [n, `${CDN}/${n}`]));
// the ST-2 flyer uses a friendly key but a different on-CDN filename
FILES['XLOCK-2024-STROXX-ADK-Model-ST-2-A4.pdf'] = `${CDN}/XLOCK-2024-Sikring-STROXX-ADK-Model-ST-2-A4.pdf`;

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

/** Legacy QR short-path → new support target. Mirrors STROXX-legacy-redirects.csv.
 *  These become `redirect` docs the middleware serves, so old printed codes keep
 *  working after the domain cutover. The MMEXO video short-paths are wired in
 *  seed-videos.ts; the external (zegsu) short-path is excluded pending ownership. */
const REDIRECTS: [from: string, to: string][] = [
  // ST-2 smart lock
  ['/smart-locks-st2', '/support/smart-locks-st2'],
  ['/xlock-software-guide', '/support/xlock-software-guide'],
  // Work light (5 language short-paths all land on the one page)
  ['/102-195_work_light_app_en', '/support/work-light'],
  ['/102-195_work_light_app_dk', '/support/work-light'],
  ['/102-195_work_light_app_de', '/support/work-light'],
  ['/102-195_work_light_app_fr', '/support/work-light'],
  ['/102-195_work_light_app_nl', '/support/work-light'],
  // Personal protective equipment
  ['/101-677-ear-muffs-foldable', '/support/sikkerhed'],
  ['/101-676-ear-plugs', '/support/sikkerhed'],
  ['/101-671-675-rhino-glove', '/support/sikkerhed'],
  ['/101-657-661-lynx-glove', '/support/sikkerhed'],
  ['/101-662-666-lynx-2nd-life-glove', '/support/sikkerhed'],
  ['/101-681-689-x-cross-safety-shoe', '/support/sikkerhed'],
  ['/100-573_ffp3-v_doc', '/support/sikkerhed'],
  ['/100-572_ffp2-v_doc', '/support/sikkerhed'],
  ['/100-572-573_ffp2+3-v_ui', '/support/sikkerhed'],
  ['/masksffp2_3', '/support/sikkerhed'],
  // Other tools
  ['/key-storage-box', '/support/key-storage-box'],
  ['/key-storage-box-app', '/support/key-storage-box'],
  ['/inspectionlight', '/support/vaerktoej'],
  ['/flashlightzoom', '/support/vaerktoej'],
  ['/fire-extinguishing-spray', '/support/vaerktoej'],
  ['/fastfix-ratchet-strap', '/support/vaerktoej'],
];

async function run() {
  console.log('Uploading PDFs from the legacy store CDN into Sanity…');
  const ids = await uploadAll();

  const st2 = {
    _id: 'support-smart-locks-st2',
    _type: 'supportPage',
    language: 'en',
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
    language: 'en',
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

  // Digital cylinders & padlocks (ST-10..ST-14 + wireless keypad). These never had a
  // legacy QR redirect, so this page exists for the FIRST time — future print runs can
  // point /qr codes at it.
  const cylinders = {
    _id: 'support-digital-cylinders',
    _type: 'supportPage',
    language: 'en',
    title: 'Digital cylinders & padlocks',
    slug: { current: 'digital-cylinders' },
    intro: 'User instructions for the STROXX electronic cylinder range, padlock and wireless keypad.',
    seoTitle: 'Digital cylinders, padlock & keypad manuals · STROXX',
    seoDescription: 'Download user instructions for the STROXX ST-10 to ST-14 electronic cylinders, padlock and wireless keypad.',
    groups: [
      group('cyl', 'Cylinders & padlock', [
        item('st10', 'ST-10 oval cylinder (single side)', fileRef(ids, '102-314_ST-10_OVAL_Cylinder_SS_UI.pdf'), '102-314'),
        item('st11', 'ST-11 mailbox cylinder', fileRef(ids, '102-315_ST-11_E_Cylinder_Mailbox_UI.pdf'), '102-315'),
        item('st12', 'ST-12 double euro cylinder', fileRef(ids, '102-316_ST-12_E_Cylinder_DOUBLE_EURO_UI.pdf'), '102-316'),
        item('st13', 'ST-13 padlock', fileRef(ids, '102-317_ST-13_E_Padlock_UI.pdf'), '102-317'),
        item('st14', 'ST-14 single euro cylinder', fileRef(ids, '102-318_ST-14_E_Cylinder_Single_UI.pdf'), '102-318'),
        item('padlock', 'Padlock (mechanical)', fileRef(ids, '101-157_Padlock_manual_ENKELT.pdf'), '101-157'),
      ]),
      group('keypad', 'Wireless keypad', [
        item('kp', 'Wireless keypad user instruction', fileRef(ids, '102-755_Wireless_Keypad_UI.pdf'), '102-755'),
      ]),
    ],
  };

  const workLight = {
    _id: 'support-work-light',
    _type: 'supportPage',
    language: 'en',
    title: 'Work light 4x 14.000L',
    slug: { current: 'work-light' },
    intro: 'App manual for the STROXX 4x 14.000 lumen work light, in five languages.',
    seoTitle: 'Work light 4x 14.000L app manual · STROXX',
    seoDescription: 'Download the STROXX 4x 14.000L work light app manual in English, Danish, German, French or Dutch.',
    groups: [
      group('all', 'All languages', [
        item('en', 'App manual · English', fileRef(ids, '102-195_Work_Light_4x_14.000L_APP_EN_UI.pdf'), '102-195'),
        item('dk', 'App-manual · Dansk', fileRef(ids, '102-195_Work_Light_4x_14.000L_APP_DK_UI.pdf'), '102-195'),
        item('de', 'App-Anleitung · Deutsch', fileRef(ids, '102-195_Work_Light_4x_14.000L_APP_DE_UI.pdf'), '102-195'),
        item('fr', 'Manuel de l’app · Français', fileRef(ids, '102-195_Work_Light_4x_14.000L_APP_FR_UI.pdf'), '102-195'),
        item('nl', 'App-handleiding · Nederlands', fileRef(ids, '102-195_Work_Light_4x_14.000L_APP_NL_UI.pdf'), '102-195'),
      ]),
    ],
  };

  // Personal protective equipment: CE declarations + mask user instructions.
  const safety = {
    _id: 'support-sikkerhed',
    _type: 'supportPage',
    language: 'en',
    title: 'Safety equipment (PPE)',
    slug: { current: 'sikkerhed' },
    intro: 'CE declarations of conformity and user instructions for STROXX protective equipment.',
    seoTitle: 'Safety equipment CE declarations · STROXX',
    seoDescription: 'CE declarations of conformity for STROXX ear protection, gloves, safety glasses, safety shoes and FFP masks.',
    groups: [
      group('hearing', 'Hearing & eye protection', [
        item('muffs', 'Ear muffs, foldable · CE declaration', fileRef(ids, '101-677-EAR-MUFFS-CE.pdf'), '101-677'),
        item('plugs', 'Ear plugs · CE declaration', fileRef(ids, '101-676-EARPLUGS-CE.pdf'), '101-676'),
        item('glasses', 'X-Protect safety glasses · CE declaration', fileRef(ids, '101-679-X-Protect-Safety-Glasses-CE.pdf'), '101-679'),
      ]),
      group('gloves', 'Gloves & footwear', [
        item('rhino', 'Rhino glove · CE declaration', fileRef(ids, '101-671-675-RHINO-Glove-CE.pdf'), '101-671-675'),
        item('lynx', 'Lynx glove · CE declaration', fileRef(ids, '101-657-661-LYNX-Glove-CE.pdf'), '101-657-661'),
        item('lynx2', 'Lynx 2nd Life glove · CE declaration', fileRef(ids, '101-662-666-LYNX-Glove-2ND-CE.pdf'), '101-662-666'),
        item('shoe', 'X-Cross safety shoe · declaration + EU type-examination', fileRef(ids, '101-681-689-X-Cross-Shoe-Stroxx.pdf'), '101-681-689'),
      ]),
      group('masks', 'FFP masks', [
        item('ffp2doc', 'FFP2 mask · declaration of conformity', fileRef(ids, '100-572_DeclarationOfConformity.pdf'), '100-572'),
        item('ffp3doc', 'FFP3 mask · declaration of conformity', fileRef(ids, '100-573_DeclarationOfConformity.pdf'), '100-573'),
        item('ffpui', 'FFP2/FFP3 masks · user instructions (2023)', fileRef(ids, '100-572-573_FFP2_3-V_UI_2023.pdf'), '100-572-573'),
        item('ffpold', 'FFP2/FFP3 masks · declaration (archive)', fileRef(ids, '144420700oe.pdf')),
      ]),
    ],
  };

  const keybox = {
    _id: 'support-key-storage-box',
    _type: 'supportPage',
    language: 'en',
    title: 'Key storage box',
    slug: { current: 'key-storage-box' },
    intro: 'Manuals for the STROXX key storage box, including the app-connected version.',
    seoTitle: 'Key storage box manual · STROXX',
    seoDescription: 'Download the STROXX key storage box manual and the app-connected version manual.',
    groups: [
      group('all', 'Manuals', [
        item('web', 'Key storage box · manual', fileRef(ids, '101-156_Key_Storage_Box_manual_WEB.pdf'), '101-156'),
        item('app', 'Key storage box (app version) · manual', fileRef(ids, '101-156_Key_Storage_Box_APP_maual_WEB.pdf'), '101-156'),
        item('appalt', 'Key storage box (app version) · manual (archive)', fileRef(ids, '101-156_Key_Storage_Box_maual_App.pdf'), '101-156'),
      ]),
    ],
  };

  const tools = {
    _id: 'support-vaerktoej',
    _type: 'supportPage',
    language: 'en',
    title: 'Tools & accessories',
    slug: { current: 'vaerktoej' },
    intro: 'Manuals and datasheets for STROXX lights, straps and accessories.',
    seoTitle: 'Tool manuals & datasheets · STROXX',
    seoDescription: 'Download manuals for the STROXX inspection light, zoom flashlight, fire-extinguishing spray, FastFix ratchet strap and power bank.',
    groups: [
      group('all', 'Manuals & datasheets', [
        item('insp', 'Mini inspection light · manual', fileRef(ids, '101-258_Mini_Inspection_light_manual_WEB.pdf'), '101-258'),
        item('flash', 'Zoom flashlight · manual', fileRef(ids, '101-257_Flashlight_zoom_manual_WEB.pdf'), '101-257'),
        item('fire', 'ECO fire-extinguishing spray · datasheet', fileRef(ids, '101-284_ECO_Fire_ex_spray_datasheet.pdf'), '101-284'),
        item('fastfix', 'FastFix 25-50mm ratchet strap · manual', fileRef(ids, '101-265_FastFix_25-50mm_manual.pdf'), '101-265'),
        item('power', 'Power bank · manual', fileRef(ids, '100-411_Power_bank_manual_web.pdf'), '100-411'),
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

  /* legacy QR short-paths → new support pages, as middleware `redirect` docs */
  const redirectDocs = REDIRECTS.map(([from, to]) => ({
    _id: `redirect-legacy-${from.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '')}`,
    _type: 'redirect',
    from,
    to,
    permanent: true,
  }));

  console.log('Writing documents…');
  // Chain the pages individually (each has its own shape, so no union type),
  // then loop the homogeneous redirect docs.
  let tx = client
    .transaction()
    .createOrReplace(st2)
    .createOrReplace(xlock)
    .createOrReplace(cylinders)
    .createOrReplace(workLight)
    .createOrReplace(safety)
    .createOrReplace(keybox)
    .createOrReplace(tools)
    .createOrReplace(qrSt2);
  for (const doc of redirectDocs) tx = tx.createOrReplace(doc);
  await tx.commit();

  console.log(`Done. 8 docs + ${redirectDocs.length} legacy redirects written.`);
  console.log('Check /support, /support/smart-locks-st2, /support/digital-cylinders and /qr/st2');
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
