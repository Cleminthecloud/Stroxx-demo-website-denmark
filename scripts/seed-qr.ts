/**
 * Seeds the managed /qr/<code> short links for packaging print runs, one per
 * real support page. These are the NEW, repointable, scan-counted codes (the
 * `qrCode` document type), served at stroxx.eu/qr/<code> and editable in the
 * Studio without a reprint. The legacy codes already in circulation are NOT
 * here: they resolve automatically via middleware (docs/STROXX-legacy-
 * redirects.csv + the /pages/<slug> → /support/<slug> rule), so duplicating
 * them as /qr codes would add nothing.
 *
 * The `code` is a PRINT CONTRACT: whatever gets printed on the box must equal
 * the code here. These codes are provisional proposals derived from the support
 * pages, confirm/adjust them with whoever owns the packaging artwork (Meena)
 * BEFORE anything goes to print, and never change a code once it's printed
 * (repoint its target instead).
 *
 * Run from the repo root (after `npx sanity login`):
 *   npm run seed:qr
 *
 * Idempotent: createOrReplace with fixed _ids (qr-<code>). Re-running only
 * refreshes label/target/active; it never changes a code's slug.
 */
import { getCliClient } from 'sanity/cli';

const client = getCliClient().withConfig({ apiVersion: '2026-07-01' });

/** [code, target, label] — code is the printed /qr/<code> slug. */
const QR_CODES: [string, string, string][] = [
  ['st2', '/support/smart-locks-st2', 'ST-2 Smart Lock · packaging QR'],
  ['xlock', '/support/xlock-software-guide', 'XLOCK software guide · packaging QR'],
  ['cylinders', '/support/digital-cylinders', 'Digital cylinders & padlocks · packaging QR'],
  ['worklight', '/support/work-light', 'Work light 4x 14.000L · packaging QR'],
  ['ppe', '/support/sikkerhed', 'Safety equipment (PPE) · packaging QR'],
  ['keybox', '/support/key-storage-box', 'Key storage box · packaging QR'],
  ['tools', '/support/vaerktoej', 'Tools & accessories · packaging QR'],
];

async function run() {
  const docs = QR_CODES.map(([code, target, label]) => ({
    _id: `qr-${code}`,
    _type: 'qrCode' as const,
    code: { current: code },
    label,
    target,
    active: true,
  }));

  console.log(`Writing ${docs.length} QR codes…`);
  let tx = client.transaction();
  for (const doc of docs) tx = tx.createOrReplace(doc);
  await tx.commit();

  console.log('Done. Managed QR codes:');
  for (const [code, target] of QR_CODES) console.log(`  /qr/${code}  →  ${target}`);
  console.log('Confirm the codes with packaging before print; repoint targets any time, never rename a printed code.');
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
