import { privateDecrypt, constants } from 'crypto';
import { stegaClean } from '@sanity/client/stega';

/** Server-only decryption for newsletter provider secrets that editors enter
 *  in the CMS. The Studio encrypts each secret in the browser with the site's
 *  RSA public key (NEXT_PUBLIC_NEWSLETTER_PUBKEY) before it is ever saved, so
 *  the (public-read) Sanity dataset only ever holds ciphertext. This module
 *  decrypts it with the matching private key, which lives ONLY in the hosting
 *  environment as NEWSLETTER_SECRET_KEY (base64 PKCS#8) and never reaches the
 *  browser. See sanity/EncryptedSecretField.tsx for the encrypt half.
 *
 *  One-time setup (both are just base64 strings, generated as a pair):
 *    NEXT_PUBLIC_NEWSLETTER_PUBKEY   base64 SPKI  — safe to expose, build-time
 *    NEWSLETTER_SECRET_KEY           base64 PKCS8 — secret, server only
 */

let cachedPem: string | null = null;
let triedPem = false;

function privateKeyPem(): string | null {
  if (triedPem) return cachedPem;
  triedPem = true;
  const b64 = process.env.NEWSLETTER_SECRET_KEY?.replace(/\s+/g, '');
  if (!b64) return (cachedPem = null);
  const body = b64.match(/.{1,64}/g)?.join('\n');
  cachedPem = body ? `-----BEGIN PRIVATE KEY-----\n${body}\n-----END PRIVATE KEY-----\n` : null;
  return cachedPem;
}

/** Decrypt one CMS ciphertext field → plaintext, or null if empty / no key /
 *  malformed. Never throws (a bad secret must not take the signup route down).
 *  stegaClean first: draft-mode CMS strings carry invisible marker chars that
 *  would corrupt the base64. */
export function decryptSecret(ciphertextB64?: string | null): string | null {
  const ct = stegaClean(ciphertextB64 || '')?.trim();
  if (!ct) return null;
  const pem = privateKeyPem();
  if (!pem) return null;
  try {
    const data = new Uint8Array(Buffer.from(ct, 'base64'));
    return privateDecrypt(
      { key: pem, padding: constants.RSA_PKCS1_OAEP_PADDING, oaepHash: 'sha256' },
      data
    ).toString('utf8');
  } catch {
    return null;
  }
}

/** Resolve a provider secret: a secret entered in the CMS (encrypted) wins;
 *  otherwise fall back to the hosting-environment variable, so existing
 *  env-based setups keep working unchanged. */
export function resolveSecret(cmsCiphertext: string | undefined, envValue: string | undefined): string | undefined {
  return decryptSecret(cmsCiphertext) ?? (envValue || undefined);
}

/** Is CMS-side encryption available at all (public key configured)? Used by the
 *  status route to tell editors to finish the one-time key setup. */
export function secretsKeyConfigured(): boolean {
  return Boolean(process.env.NEWSLETTER_SECRET_KEY);
}
