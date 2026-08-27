import { createHash, createHmac, timingSafeEqual } from 'crypto';
import { createClient, type SanityClient } from '@sanity/client';
import { projectId, dataset } from '@/sanity/env';

/** The permission database seam.
 *
 *  ONE record per person per market, written on our own domain, independent of
 *  whichever email platform is doing the sending this year. The email platform
 *  holds a subscriber; this holds the PROOF of what was agreed, plus the
 *  attributes we want to segment on (country, dealer/partner, language, signup
 *  surface, campaign, and, only with a separate yes, what they looked at).
 *
 *  Why a seam and not just "Sanity code": every write goes through this module,
 *  so moving the store to a real database later is one file, exactly like
 *  lib/catalog and lib/stores. Nothing else in the app knows where permissions
 *  live. See docs/STROXX-permission-database.md.
 *
 *  THREE INVARIANTS, each of them the answer to a real attack:
 *
 *  1. NEVER WRITE PII INTO A PUBLIC DATASET. A Sanity dataset can be read by
 *     anyone with the project ID unless it is private, and the site ships the
 *     project ID to the browser. So this module PROBES the dataset without a
 *     token before its first write: if that probe succeeds, the dataset is
 *     world-readable, and no permission is ever written. Fail closed. Making
 *     the dataset private (and giving the site a read token) is the one
 *     operational step this feature needs before it may be switched on.
 *
 *  2. NEVER OVERWRITE PROVEN CONSENT. The document ID is derived from the
 *     address, and the signup endpoint is public, so anyone can POST somebody
 *     else's address. A CONFIRMED record therefore keeps its evidence: a later
 *     unconfirmed signup can refresh the sync fields and nothing else. Without
 *     this, the "proof" is third-party writable, which makes it not proof.
 *
 *  3. THE COOKIE IS ISSUED ON CONFIRMATION, NEVER ON SIGNUP. The record ID is
 *     a derivable hash, not a secret, so a signup must not hand the browser a
 *     capability pointing at a record whose owner has not been verified.
 *
 *  Fails soft, always. A permission write must never break a signup: the person
 *  did consent, and the email platform already has them. Failures are logged
 *  for operators, never surfaced to the visitor. */

export const CONSENT_COOKIE = 'sx_pid';

/** Interest signals are capped so one enthusiastic visitor cannot grow a
 *  document without bound, and so the record stays a summary rather than a
 *  browsing diary. */
const MAX_INTERESTS = 40;

/** Every Sanity call here is on or near a request path, so none of them may
 *  hang: the client's default timeout is minutes, and this route's budget is
 *  30 seconds. */
const WRITE_TIMEOUT_MS = 6000;

export type PermissionStatus = 'pending' | 'confirmed' | 'unsubscribed' | 'suppressed';

export type PermissionInput = {
  email: string;
  market?: string;
  marketName?: string;
  partner?: string;
  language?: string;
  newsletterConsent: boolean;
  behaviourConsent: boolean;
  consentVersion?: string;
  consentText?: string;
  sourcePath?: string;
  sourceSurface?: string;
  campaign?: string;
  consentIp?: string;
  userAgent?: string;
  provider?: string;
  providerId?: string;
  /** 'pending' where the platform runs double opt-in and the link has not been
   *  clicked; 'confirmed' where the platform made the contact live at once.
   *  Nothing may be mailed from a pending record. */
  status?: PermissionStatus;
};

export const sha256 = (v: string) => createHash('sha256').update(v).digest('hex');

/** Deterministic document ID: the same address in the same market always
 *  updates the same record, so a second signup renews consent instead of
 *  creating a duplicate the team would later have to reconcile.
 *
 *  Derivable on purpose, and therefore NEVER an authenticator. Anything that
 *  needs to prove it holds a record uses `permissionToken` below. */
export function permissionId(email: string, market: string): string {
  return `permission.${sha256(`${email.trim().toLowerCase()}|${market || 'int'}`).slice(0, 32)}`;
}

/** Keyed token over a record ID, for confirmation and withdrawal links. Reuses
 *  the newsletter key pair's server half, which is already required in the
 *  hosting environment and already rotated on the standard policy. Returns null
 *  when no key is configured, which is what keeps those routes fail-closed. */
export function permissionToken(id: string): string | null {
  const key = process.env.NEWSLETTER_SECRET_KEY;
  if (!key) return null;
  return createHmac('sha256', key).update(id).digest('hex').slice(0, 32);
}

export function permissionTokenValid(id: string, token: string): boolean {
  const expected = permissionToken(id);
  if (!expected || typeof token !== 'string' || token.length !== expected.length) return false;
  /* Compared byte-wise in constant time: a plain === leaks the shared prefix
     length through timing, which is enough to forge a token one nibble at a
     time. TextEncoder rather than Buffer so the value types line up. */
  const enc = new TextEncoder();
  return timingSafeEqual(enc.encode(expected), enc.encode(token));
}

function writeClient(): SanityClient | null {
  const token = process.env.SANITY_API_WRITE_TOKEN;
  if (!token) return null;
  return createClient({ projectId, dataset, apiVersion: '2026-07-01', token, useCdn: false, timeout: WRITE_TIMEOUT_MS });
}

/** Invariant 1. An unauthenticated query that SUCCEEDS proves the dataset is
 *  world-readable, which means every address, IP and consent line we wrote
 *  would be downloadable by anyone who read the project ID out of the page
 *  source. Probed once per process and cached; anything unclear counts as
 *  public, because guessing wrong in the other direction publishes people's
 *  personal data. */
let publicDataset: boolean | null = null;

export async function datasetIsPrivate(): Promise<boolean> {
  if (publicDataset !== null) return !publicDataset;
  try {
    const url = `https://${projectId}.api.sanity.io/v2026-07-01/data/query/${dataset}?query=${encodeURIComponent('count(*[_type=="permission"])')}`;
    const r = await fetch(url, { signal: AbortSignal.timeout(5000), cache: 'no-store' });
    publicDataset = r.ok;
  } catch {
    publicDataset = true;
  }
  if (publicDataset) {
    console.error(
      `[permissions] REFUSING TO WRITE: dataset "${dataset}" answers unauthenticated queries, so any permission record would be publicly readable. Make the dataset private (and give the site a read token) before enabling the permission database. See docs/STROXX-permission-database.md.`
    );
  }
  return !publicDataset;
}

/** Record a permission. Returns the document ID, or null when nothing was
 *  written (no write token, public dataset, or a confirmed record that must
 *  not be overwritten). The caller must NOT treat a returned ID as proof that
 *  this browser belongs to that person: see invariant 3. */
export async function recordPermission(input: PermissionInput): Promise<string | null> {
  const client = writeClient();
  if (!client) {
    console.warn('[permissions] SANITY_API_WRITE_TOKEN missing; permission record not stored');
    return null;
  }
  if (!(await datasetIsPrivate())) return null;

  const email = input.email.trim().toLowerCase();
  const market = input.market || 'int';
  const _id = permissionId(email, market);
  const now = new Date().toISOString();

  /* Fields that describe THIS act of consent. A renewal overwrites them on
     purpose: the newest agreement is the one we must be able to prove. But
     only on a record that is not already confirmed, see invariant 2. */
  const consentFields = {
    email,
    emailHash: sha256(email),
    market,
    marketName: input.marketName || '',
    partner: input.partner || '',
    language: input.language || '',
    newsletterConsent: input.newsletterConsent,
    behaviourConsent: input.behaviourConsent,
    consentVersion: input.consentVersion || '',
    consentText: input.consentText || '',
    consentAt: now,
    sourcePath: input.sourcePath || '',
    sourceSurface: input.sourceSurface || '',
    campaign: input.campaign || '',
    consentIp: input.consentIp || '',
    userAgent: (input.userAgent || '').slice(0, 300),
    provider: input.provider || '',
    providerId: input.providerId || '',
    syncedAt: now,
    status: input.status || 'pending',
  };

  try {
    const existing = await client.fetch<{ status?: string } | null>(
      '*[_id == $id][0]{status}',
      { id: _id },
      { cache: 'no-store' }
    );

    /* Invariant 2: a confirmed permission is evidence, and the endpoint that
       reaches this line is public. Refresh the sync fields, touch nothing that
       could be produced in a dispute, and hand back no ID. */
    if (existing?.status === 'confirmed') {
      await client
        .patch(_id)
        .set({ provider: input.provider || '', providerId: input.providerId || '', syncedAt: now, lastSignupAttemptAt: now })
        .commit({ visibility: 'async', returnDocuments: false });
      return null;
    }

    await client
      .transaction()
      .createIfNotExists({ _id, _type: 'permission', ...consentFields, interests: [] })
      .patch(_id, (p) => {
        let q = p.set(consentFields).unset(['syncError', 'unsubscribedAt']);
        /* Withdrawing behaviour consent must actually erase the history it
           produced, not just stop adding to it. */
        if (!input.behaviourConsent) q = q.set({ interests: [] });
        return q;
      })
      .commit({ visibility: 'async', returnDocuments: false });
    return _id;
  } catch (err) {
    const e = err as { statusCode?: number; message?: string };
    console.error('[permissions] write failed:', e?.statusCode ?? '', e?.message ?? 'unknown error');
    return null;
  }
}

/** Mark a double opt-in confirmation. This is the ONLY thing that makes a
 *  record mailable, and the only place a browser may be handed the interest
 *  cookie. Called by /api/newsletter/confirm with a keyed token. */
export async function confirmPermission(id: string): Promise<boolean> {
  const client = writeClient();
  if (!client) return false;
  if (!/^permission\.[a-f0-9]{32}$/.test(id)) return false;
  if (!(await datasetIsPrivate())) return false;
  try {
    await client
      .patch(id)
      .set({ status: 'confirmed', confirmedAt: new Date().toISOString() })
      .commit({ visibility: 'async', returnDocuments: false });
    return true;
  } catch {
    return false;
  }
}

/** Withdraw. Keeps the record (the proof of what was once agreed, and the
 *  suppression entry that stops us mailing them again) but erases every
 *  behavioural signal and closes the permission. */
export async function withdrawPermission(id: string): Promise<boolean> {
  const client = writeClient();
  if (!client) return false;
  if (!/^permission\.[a-f0-9]{32}$/.test(id)) return false;
  if (!(await datasetIsPrivate())) return false;
  try {
    await client
      .patch(id)
      .set({
        status: 'unsubscribed',
        newsletterConsent: false,
        behaviourConsent: false,
        unsubscribedAt: new Date().toISOString(),
        interests: [],
      })
      .commit({ visibility: 'async', returnDocuments: false });
    return true;
  } catch {
    return false;
  }
}

/** Add one interest signal to a record. Read, merge, write: the volume here is
 *  a few writes per consenting subscriber per session, so a transaction-level
 *  trick would buy nothing and cost clarity.
 *
 *  Refuses unless the record itself still says behaviourConsent is true AND it
 *  is confirmed. The cookie is a hint; the record is the authority. That check
 *  is the difference between a consented interest signal and covert profiling. */
export async function recordInterest(id: string, slug: string, kind: 'product' | 'category'): Promise<void> {
  const client = writeClient();
  if (!client) return;
  if (!/^permission\.[a-f0-9]{32}$/.test(id)) return;
  if (!/^[a-z0-9-]{1,80}$/.test(slug)) return;
  if (!(await datasetIsPrivate())) return;

  try {
    const doc = await client.fetch<{ behaviourConsent?: boolean; status?: string; interests?: Interest[] } | null>(
      '*[_id == $id][0]{behaviourConsent, status, interests}',
      { id },
      { cache: 'no-store' }
    );
    if (!doc || doc.behaviourConsent !== true || doc.status !== 'confirmed') return;

    const now = new Date().toISOString();
    const list: Interest[] = Array.isArray(doc.interests) ? doc.interests.map((i) => ({ ...i })) : [];
    const hit = list.find((i) => i.slug === slug && i.kind === kind);
    if (hit) {
      hit.count = (hit.count || 0) + 1;
      hit.lastAt = now;
    } else {
      list.push({ _key: sha256(`${kind}:${slug}`).slice(0, 12), slug, kind, count: 1, lastAt: now });
    }
    /* Newest activity first, then trim: the record stays a picture of current
       interest rather than an ever-growing log. */
    list.sort((a, b) => (b.lastAt || '').localeCompare(a.lastAt || ''));

    await client
      .patch(id)
      .set({ interests: list.slice(0, MAX_INTERESTS), lastSeenAt: now })
      .commit({ visibility: 'async', returnDocuments: false });
  } catch (err) {
    const e = err as { message?: string };
    console.error('[permissions] interest write failed:', e?.message ?? 'unknown error');
  }
}

export type Interest = {
  _key?: string;
  slug: string;
  kind: string;
  count: number;
  lastAt: string;
};
