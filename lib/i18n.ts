export type Locale = {
  id: string; // documentInternationalization language id + the value of the `language` field
  title: string; // native display name (used in the switcher)
  htmlLang: string; // value for <html lang>
  market: string; // market code (int/dk/de/fr/be), joins to lib/markets.ts
  path: string; // URL prefix: '' for the reference root, else '/dk', '/be/nl', ...
  isReference?: boolean;
};

/** The canonical locale registry: one entry per market-language. Both the Sanity
 *  document-internationalization plugin (supportedLanguages) and the URL routing
 *  read this. Two markets can share a base language (France fr, Belgium fr), so
 *  locale ids are region-qualified to keep them distinct.
 *  See docs/STROXX-market-localisation-plan.md. */
export const locales: Locale[] = [
  { id: 'en', title: 'English', htmlLang: 'en', market: 'int', path: '', isReference: true },
  { id: 'da-DK', title: 'Dansk', htmlLang: 'da', market: 'dk', path: '/dk' },
  { id: 'de-DE', title: 'Deutsch', htmlLang: 'de', market: 'de', path: '/de' },
  { id: 'fr-FR', title: 'Français', htmlLang: 'fr', market: 'fr', path: '/fr' },
  { id: 'nl-BE', title: 'Nederlands (België)', htmlLang: 'nl', market: 'be', path: '/be/nl' },
  { id: 'fr-BE', title: 'Français (Belgique)', htmlLang: 'fr', market: 'be', path: '/be/fr' },
];

export const REFERENCE_LOCALE: Locale = locales.find((l) => l.isReference) ?? locales[0];

export const localeById = (id?: string): Locale | undefined => (id ? locales.find((l) => l.id === id) : undefined);

export const localesForMarket = (marketCode: string): Locale[] => locales.filter((l) => l.market === marketCode);

/** supportedLanguages for the document-internationalization plugin config. */
export const supportedLanguages = locales.map((l) => ({ id: l.id, title: l.title }));

/** Resolve a locale from a URL pathname by longest matching path prefix. Bare
 *  market roots (e.g. /be) and unmatched paths fall back to the reference (root). */
export function localeFromPath(pathname: string): Locale {
  const withSlash = pathname.endsWith('/') ? pathname : pathname + '/';
  const match = locales
    .filter((l) => l.path && (withSlash.startsWith(l.path + '/') || pathname === l.path))
    .sort((a, b) => b.path.length - a.path.length)[0];
  return match ?? REFERENCE_LOCALE;
}

/** Strip a known locale prefix from a pathname, returning the in-locale path. */
export function stripLocale(pathname: string, locale: Locale): string {
  if (!locale.path) return pathname || '/';
  const rest = pathname.slice(locale.path.length) || '/';
  return rest.startsWith('/') ? rest : '/' + rest;
}
