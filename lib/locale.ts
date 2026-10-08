import { headers } from 'next/headers';
import { localeById, locales, REFERENCE_LOCALE, type Locale } from '@/lib/i18n';

/** The current request's locale, resolved by the proxy and passed via the
 *  x-stroxx-locale header. Falls back to the international English reference. */
export async function getLocale(): Promise<Locale> {
  try {
    const h = await headers();
    return localeById(h.get('x-stroxx-locale') ?? undefined) ?? REFERENCE_LOCALE;
  } catch {
    return REFERENCE_LOCALE;
  }
}

/** The locale path prefix of the current request ('/dk' on stroxx.eu/dk/...,
 *  '' on a country domain or the international root). Prefix internal links
 *  with it so a Danish visitor stays on the Danish site. Only ever one of the
 *  registered locale paths: a forged header can not inject anything else. */
export async function getLocalePrefix(): Promise<string> {
  try {
    const h = await headers();
    const p = h.get('x-stroxx-prefix') ?? '';
    return locales.some((l) => l.path === p) ? p : '';
  } catch {
    return '';
  }
}
