import { headers } from 'next/headers';
import { localeById, REFERENCE_LOCALE, type Locale } from '@/lib/i18n';

/** The current request's locale, resolved by the middleware and passed via the
 *  x-stroxx-locale header. Falls back to the international English reference. */
export async function getLocale(): Promise<Locale> {
  try {
    const h = await headers();
    return localeById(h.get('x-stroxx-locale') ?? undefined) ?? REFERENCE_LOCALE;
  } catch {
    return REFERENCE_LOCALE;
  }
}
