import { localeById } from '../../lib/i18n';

/** Human-readable language name for Studio list previews, so translations of
 *  the same document are distinguishable in every list. Mirrors the
 *  LANG_IS_EN contract in lib/cms.ts: a document with no language field is
 *  the English base. */
export const langLabel = (id?: string): string =>
  id ? (localeById(id)?.title ?? id) : 'English (base)';

/** URL path prefix for a document's language: '' for the English base and
 *  reference locale, '/dk' for Danish, '/be/nl' for Belgian Dutch, etc. */
export const langPath = (id?: string): string => (id ? (localeById(id)?.path ?? '') : '');
