/** Primary public URL path for a document, shared by the "See page" and
 *  "Open in Edit site" document actions (sanity/SeePageAction). This mirrors
 *  the PRIMARY location in sanity.config.ts Presentation resolve.locations:
 *  keep the slug patterns here in sync with that map (see DEPENDENCIES.md,
 *  "Studio document actions"). Returns null for documents with no standalone
 *  page (specialists, testimonials, films, augments, QR codes, redirects,
 *  feedback), so the action hides itself there. */

type Doc = Record<string, unknown> | null | undefined;

function slugOf(doc: Doc): string {
  const s = (doc as { slug?: unknown })?.slug;
  if (s && typeof s === 'object' && 'current' in s) return String((s as { current?: unknown }).current ?? '');
  return typeof s === 'string' ? s : '';
}

export function primaryHref(type: string | undefined, doc: Doc): string | null {
  const s = slugOf(doc);
  switch (type) {
    case 'landingPage':
      return s === 'proev-det' ? '/proev-det' : `/kampagne/${s}`;
    case 'post':
      return `/nyheder/${s}`;
    case 'supportPage':
      return `/support/${s}`;
    case 'trade':
      return `/fag/${s}`;
    case 'legalPage':
      return `/${s}`;
    case 'homePage':
      return '/';
    case 'brandPage':
      return '/brand';
    case 'monthlyLineup':
      return '/maanedens';
    case 'store':
      return '/butikker';
    case 'siteSettings':
      return '/';
    default:
      return null;
  }
}
