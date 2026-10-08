/**
 * The AI page builder's write path: turns a page spec (JSON, written by Claude
 * from the editor's Word brief, PDF data sheet, product links and PIM data)
 * into an UNPUBLISHED DRAFT focus page in Sanity. It never publishes: the
 * editor opens the draft in the Studio (Edit site), checks it, and presses
 * Publish. That review step is the safety net, and this script keeps it.
 *
 *   node scripts/focus-draft.mjs page.json --env .env.local            write the draft
 *   node scripts/focus-draft.mjs page.json --env .env.local --check    validate only
 *   node scripts/focus-draft.mjs page.json --env .env.local --replace-draft
 *
 * Guard rails (scripts/focus/validate.mjs, unit-tested):
 *  - only blocks that exist in the Studio, only https/relative links;
 *  - no prices anywhere, no script text, the English base dealer-neutral;
 *  - an existing draft is never overwritten without --replace-draft, so an
 *    editor's half-finished work can not be lost;
 *  - writes ONLY to the drafts.* id; a published page stays untouched until
 *    the editor publishes the new draft.
 *
 * Images: anywhere the spec has { "imageUrl": "https://...", "alt": "..." } or
 * { "imagePath": "./photo.jpg", "alt": "..." }, the file is uploaded and the
 * field becomes a real Sanity image. Videos: { "videoFileUrl"|"videoFilePath" }.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { validateSpec, focusDocId, draftId } from './focus/validate.mjs';

const args = process.argv.slice(2);
const specPath = args.find((a) => !a.startsWith('--') && args[args.indexOf(a) - 1] !== '--env');
const flag = (f) => args.includes(f);
const envIdx = args.indexOf('--env');
if (envIdx >= 0) {
  for (const line of fs.readFileSync(path.resolve(args[envIdx + 1]), 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
  }
}
if (!specPath) {
  console.error('Usage: node scripts/focus-draft.mjs page.json --env .env.local [--check] [--replace-draft]');
  process.exit(1);
}
const specDir = path.dirname(path.resolve(specPath));
const spec = JSON.parse(fs.readFileSync(specPath, 'utf8'));
const { errors, warnings } = validateSpec(spec);
warnings.forEach((w) => console.warn('warning:', w));
if (errors.length) {
  errors.forEach((e) => console.error('error:', e));
  console.error(`\n${errors.length} problem(s); nothing was written.`);
  process.exit(2);
}
if (flag('--check')) {
  console.log('Spec is valid. Nothing written (--check).');
  process.exit(0);
}

const token = process.env.SANITY_API_WRITE_TOKEN;
if (!token) {
  console.error('SANITY_API_WRITE_TOKEN missing (pass --env .env.local)');
  process.exit(1);
}
const { createClient } = await import(process.env.SANITY_CLIENT_ENTRY || '@sanity/client');
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'cr7dktly',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'demo',
  apiVersion: '2026-07-12',
  token,
  useCdn: false,
});

/* ── uploads ─────────────────────────────────────────────────────────────── */
async function bytes(url, file) {
  if (file) {
    const abs = path.resolve(specDir, file);
    if (abs !== specDir && !abs.startsWith(specDir + path.sep)) throw new Error(`refusing to read outside the spec folder: ${file}`);
    return { buf: fs.readFileSync(abs), name: path.basename(abs) };
  }
  if (!/^https:\/\//.test(url)) throw new Error(`only https downloads: ${url}`);
  const res = await fetch(url, { headers: { 'user-agent': 'stroxx-focus-draft/1.0' } });
  if (!res.ok) throw new Error(`download ${res.status} ${url}`);
  return { buf: Buffer.from(await res.arrayBuffer()), name: decodeURIComponent(url.split('/').pop().split('?')[0]) || 'asset' };
}
async function resolveAssets(v) {
  if (Array.isArray(v)) return Promise.all(v.map(resolveAssets));
  if (!v || typeof v !== 'object') return v;
  if (v.imageUrl || v.imagePath) {
    const { buf, name } = await bytes(v.imageUrl, v.imagePath);
    const a = await client.assets.upload('image', buf, { filename: name });
    const { imageUrl, imagePath, ...rest } = v;
    void imageUrl;
    void imagePath;
    return { _type: rest._type || 'image', ...rest, asset: { _type: 'reference', _ref: a._id } };
  }
  const out = {};
  for (const [k, x] of Object.entries(v)) {
    if ((k === 'videoFileUrl' || k === 'videoFilePath') && typeof x === 'string') {
      const { buf, name } = await bytes(k === 'videoFileUrl' ? x : '', k === 'videoFilePath' ? x : '');
      const a = await client.assets.upload('file', buf, { filename: name });
      out.videoFile = { _type: 'file', asset: { _type: 'reference', _ref: a._id } };
    } else out[k] = await resolveAssets(x);
  }
  return out;
}
/** Every array item needs a _key in Sanity. */
function addKeys(v) {
  if (Array.isArray(v)) return v.map((x) => (x && typeof x === 'object' && !Array.isArray(x) ? { _key: x._key || crypto.randomBytes(6).toString('hex'), ...addKeys(x) } : addKeys(x)));
  if (!v || typeof v !== 'object') return v;
  return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, addKeys(x)]));
}

/* ── write ───────────────────────────────────────────────────────────────── */
const id = focusDocId(spec.slug, spec.language);
const did = draftId(id);
const existingDraft = await client.fetch('*[_id == $did][0]{_id, _updatedAt}', { did });
if (existingDraft && !flag('--replace-draft')) {
  console.error(`A draft already exists (${did}, last edited ${existingDraft._updatedAt}). Someone may be working on it.`);
  console.error('Nothing written. Re-run with --replace-draft only if you are sure it can go.');
  process.exit(3);
}
let category;
if (spec.categoryKey) {
  const cat = await client.fetch('*[_type == "focusCategory" && key == $k && language == $l][0]._id', { k: spec.categoryKey, l: spec.language });
  if (!cat) console.warn(`warning: no "${spec.categoryKey}" category in ${spec.language} yet; create it under Focus on → Categories, then pick it on the page`);
  else category = { _type: 'reference', _ref: cat };
}
const doc = addKeys(
  await resolveAssets({
    _id: did,
    _type: 'focusPage',
    language: spec.language,
    title: spec.title,
    slug: { _type: 'slug', current: spec.slug },
    month: spec.month,
    teaser: spec.teaser,
    ...(category ? { category } : {}),
    tags: spec.tags || [],
    itemNumbers: spec.itemNumbers || [],
    ...(spec.cardImage ? { cardImage: spec.cardImage } : {}),
    ...(spec.cutout ? { cutout: spec.cutout } : {}),
    seoTitle: spec.seoTitle,
    seoDescription: spec.seoDescription,
    sections: spec.sections,
  }),
);
await client.createOrReplace(doc);
const prefix = { 'da-DK': '/dk', 'de-DE': '/de', 'fr-FR': '/fr', 'nl-BE': '/be/nl', 'fr-BE': '/be/fr' }[spec.language] || '';
console.log(`Draft written: ${did}`);
console.log(`Review it in the Studio: /studio/intent/edit/id=${id};type=focusPage`);
console.log(`Preview path once published: ${prefix}/focus-on/${spec.slug}`);
console.log('It is NOT live. Open it in Edit site, check every block, then press Publish.');
