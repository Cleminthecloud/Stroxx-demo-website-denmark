/**
 * ONE-TIME (idempotent) import of people photos into Sanity as REAL image
 * assets, so the Studio shows what the site shows.
 *
 * Why: the seeds filled string fallbacks (specialist.photoUrl, store
 * managerPhoto, store specialist.photo) with paths/CDN URLs. The site renders
 * those fine, but in the Studio the image fields look empty, which reads as
 * "no photo in the CMS". This script uploads each referenced photo to the
 * Sanity media library and sets the proper image field. The string fallback
 * stays in place (the site prefers the upload via ?? , nothing can regress).
 *
 * Idempotent: only touches docs where the image field is missing; the same
 * photo URL/path uploads once (cached per run, and Sanity dedupes identical
 * bytes by content hash anyway).
 *
 * Sources: paths starting with / are read from ./public, anything else is
 * fetched over https.
 *
 * Run from the repo root (reads .env.local for the write token):
 *   npm run import:photos
 */
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { createClient } from '@sanity/client';

for (const line of existsSync('.env.local') ? readFileSync('.env.local', 'utf8').split('\n') : []) {
  const m = line.match(/^([A-Z_]+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
}

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  token: process.env.SANITY_API_WRITE_TOKEN,
  apiVersion: '2026-07-01',
  useCdn: false,
});

const cache = new Map<string, string>(); // source -> asset _id

async function assetFor(src: string): Promise<string | null> {
  const hit = cache.get(src);
  if (hit) return hit;
  try {
    let buf: Buffer;
    let filename: string;
    if (src.startsWith('/')) {
      const p = join(process.cwd(), 'public', src);
      if (!existsSync(p)) {
        console.warn(`  SKIP missing file: ${src}`);
        return null;
      }
      buf = readFileSync(p);
      filename = src.split('/').pop() || 'photo.jpg';
    } else {
      const res = await fetch(src);
      if (!res.ok) {
        console.warn(`  SKIP http ${res.status}: ${src}`);
        return null;
      }
      buf = Buffer.from(await res.arrayBuffer());
      filename = decodeURIComponent(decodeURIComponent(src.split('/').pop() || 'photo.jpg')).split('?')[0];
    }
    const asset = await client.assets.upload('image', buf, { filename });
    cache.set(src, asset._id);
    console.log(`  uploaded ${filename} -> ${asset._id}`);
    return asset._id;
  } catch (err) {
    console.warn(`  SKIP (${err instanceof Error ? err.message : err}): ${src}`);
    return null;
  }
}

const imageRef = (id: string) => ({ _type: 'image', asset: { _type: 'reference', _ref: id } });

async function run() {
  console.log('Specialists (photoUrl -> photoUpload):');
  const specialists: { _id: string; photoUrl: string }[] = await client.fetch(
    '*[_type == "specialist" && defined(photoUrl) && !defined(photoUpload.asset)]{_id, photoUrl}'
  );
  for (const s of specialists) {
    const id = await assetFor(s.photoUrl);
    if (id) {
      await client.patch(s._id).set({ photoUpload: imageRef(id) }).commit({ returnDocuments: false });
      console.log(`  ${s._id}: photoUpload set`);
    }
  }

  console.log('Store managers (managerPhoto -> managerPhotoUpload):');
  const managers: { _id: string; managerPhoto: string }[] = await client.fetch(
    '*[_type == "store" && defined(managerPhoto) && !defined(managerPhotoUpload.asset)]{_id, managerPhoto}'
  );
  for (const s of managers) {
    const id = await assetFor(s.managerPhoto);
    if (id) {
      await client.patch(s._id).set({ managerPhotoUpload: imageRef(id) }).commit({ returnDocuments: false });
      console.log(`  ${s._id}: managerPhotoUpload set`);
    }
  }

  console.log('Store specialists (specialist.photo -> specialist.photoUpload):');
  const storeSpecs: { _id: string; url: string }[] = await client.fetch(
    '*[_type == "store" && defined(specialist.photo) && !defined(specialist.photoUpload.asset)]{_id, "url": specialist.photo}'
  );
  for (const s of storeSpecs) {
    const id = await assetFor(s.url);
    if (id) {
      await client.patch(s._id).set({ 'specialist.photoUpload': imageRef(id) }).commit({ returnDocuments: false });
      console.log(`  ${s._id}: specialist.photoUpload set`);
    }
  }

  console.log(`Done. ${cache.size} unique photos uploaded or reused this run.`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
