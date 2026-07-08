/**
 * Tags existing content documents as the English base (language: 'en') for the
 * document-internationalization plugin. Run ONCE after the plugin is enabled,
 * before creating any translations.
 *
 * SAFE: setIfMissing only, so it never overwrites a language already set, and
 * it only touches the internationalised content types.
 *
 * Run from the repo root (after `npx sanity login`):
 *   npm run seed:i18n-base
 */
import { getCliClient } from 'sanity/cli';

const client = getCliClient().withConfig({ apiVersion: '2026-07-01' });

const TYPES = ['homePage', 'siteSettings', 'landingPage', 'supportPage', 'post', 'legalPage', 'monthlyLineup', 'trade', 'productAugment'];

async function run() {
  const ids: string[] = await client.fetch('*[_type in $types && !defined(language)]._id', { types: TYPES });
  if (!ids.length) {
    console.log('Nothing to tag: every content document already has a language.');
    return;
  }
  let tx = client.transaction();
  for (const id of ids) tx = tx.patch(id, (p) => p.setIfMissing({ language: 'en' }));
  await tx.commit({ returnDocuments: false });
  console.log(`Tagged ${ids.length} existing documents as the English base (language: en).`);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
