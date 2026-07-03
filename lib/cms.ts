import { stegaClean } from '@sanity/client/stega';
import { sanityFetch } from '@/sanity/lib/live';
import { products, Product } from '@/lib/data';
import { SKA } from '@/lib/ska';

/** CMS access layer with hardcoded fallbacks: if the dataset is empty or
 *  unreachable, every consumer renders exactly what it rendered before the
 *  CMS existed. Same seam philosophy as lib/data.ts. */

export type SiteSettings = {
  retailerName?: string;
  supportPhone?: string;
  supportHours?: string;
  legalLine?: string;
  gtmId?: string;
};

export async function getSiteSettings(): Promise<SiteSettings | null> {
  try {
    const { data } = await sanityFetch({ query: '*[_type == "siteSettings"][0]' });
    return (data as SiteSettings) ?? null;
  } catch {
    return null;
  }
}

/* ── Landing pages ──────────────────────────────────────────────────────── */

export type LandingSection = { _type: string; _key: string } & Record<string, any>;
export type LandingDoc = {
  _id?: string;
  title?: string;
  slug?: { current?: string };
  seoTitle?: string;
  seoDescription?: string;
  sections?: LandingSection[];
};

export async function getLandingPage(slug: string): Promise<LandingDoc | null> {
  try {
    const { data } = await sanityFetch({
      query: '*[_type == "landingPage" && slug.current == $slug][0]',
      params: { slug },
    });
    return (data as LandingDoc) ?? null;
  } catch {
    return null;
  }
}

/** Join SKUs from the CMS against the product feed. Unknown codes are dropped
 *  silently (an editor typo must never crash a page). stegaClean strips the
 *  invisible edit-tracking characters draft mode adds to strings. */
export function productsBySkus(skus: (string | undefined)[] | undefined): Product[] {
  return (skus ?? [])
    .map((c) => products.find((p) => p.code === stegaClean(c)))
    .filter(Boolean) as Product[];
}

/* ── Månedens STROXX (SKA) ──────────────────────────────────────────────── */

export type SkaData = typeof SKA;

export async function getSka(): Promise<SkaData> {
  try {
    const { data } = await sanityFetch({
      query: '*[_type == "monthlyLineup"] | order(_createdAt desc)[0]',
    });
    if (!data) return SKA;
    const d = data as Record<string, any>;
    const find = (code?: string) => products.find((p) => p.code === stegaClean(code));
    const hero = find(d.heroSku);
    const cashCows = productsBySkus(d.cashCowSkus);
    const nyheder = ((d.news ?? []) as Record<string, any>[])
      .map((n) => ({ type: (n.label as string) ?? '', product: find(n.sku), pitch: (n.pitch as string) ?? '' }))
      .filter((n) => n.product) as SkaData['nyheder'];
    return {
      month: (d.month as string) || SKA.month,
      year: (d.year as string) || SKA.year,
      hero: hero ?? SKA.hero,
      heroClaims: d.heroClaims?.length
        ? (d.heroClaims as Record<string, any>[]).map((c) => ({ title: c.title ?? '', body: c.body ?? '' }))
        : SKA.heroClaims,
      heroCases: d.heroCases?.length
        ? (d.heroCases as Record<string, any>[]).map((c) => ({ trade: c.trade ?? '', use: c.use ?? '' }))
        : SKA.heroCases,
      heroFaq: d.heroFaq?.length
        ? (d.heroFaq as Record<string, any>[]).map((f) => ({ q: f.q ?? '', a: f.a ?? '' }))
        : SKA.heroFaq,
      cashCows: cashCows.length ? cashCows : SKA.cashCows,
      nyheder: nyheder.length ? nyheder : SKA.nyheder,
    };
  } catch {
    return SKA;
  }
}
