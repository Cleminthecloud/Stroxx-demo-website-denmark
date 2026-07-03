import { stegaClean } from '@sanity/client/stega';
import { sanityFetch } from '@/sanity/lib/live';
import { products, Product } from '@/lib/data';
import { SKA } from '@/lib/ska';
import { stores as fallbackStores, Store, StoreBrand, StoreRegion } from '@/lib/stores';

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

/* ── Homepage copy ──────────────────────────────────────────────────────── */

export type HomeStat = { value: number; suffix: string; label: string };
export type HomeCopy = {
  heroLine1: string; heroLine2: string;
  claimWhite: string; claimBlue: string; claimSub: string;
  marqueeText: string;
  rangeHeadline: string; rangeCol1Label: string; rangeCol1Text: string; rangeCol2Label: string; rangeCol2Text: string;
  scaleHeadline: string; scaleCol1Label: string; scaleCol1Text: string; scaleCol2Label: string; scaleCol2Text: string;
  stats: HomeStat[];
  specialistsHeadline: string;
  guaranteeHeadline: string; guaranteeText: string;
  monthHeadline: string; monthBlue: string; monthText: string;
  categoriesHeadline: string;
  ctaLabel: string;
  _id?: string;
};

/** The exact pre-CMS copy: any field left empty in the Studio renders this. */
export const HOME_DEFAULTS: HomeCopy = {
  heroLine1: 'A *great* headline',
  heroLine2: 'will be here',
  claimWhite: 'Here we have another great headline',
  claimBlue: 'for the reader.',
  claimSub:
    "Serious tools, seriously fair. Only at Carl Ras BYG. And remember: always 100% satisfaction guarantee, so there's not much to think twice about.",
  marqueeText: 'A great headline will be here',
  rangeHeadline: 'You got what \n it takes \n ...so do *we*',
  rangeCol1Label: 'The selection',
  rangeCol1Text:
    'Tools, equipment, accessories and consumables. From laser measures and saw blades to hand tools, socket sets and protective gear. STROXX has most of it.',
  rangeCol2Label: 'The service',
  rangeCol2Text:
    "And we have your back. So you never walk away empty-handed or with the wrong thing. It's not just the tools that are sharp.",
  scaleHeadline: 'More than \n *1,400* product numbers.',
  scaleCol1Label: 'Every day',
  scaleCol1Text:
    "Whether you need a Viking arm or clean hands, we've got what you're after. In the webshop at carl-ras.dk and in 26 stores across the country.",
  scaleCol2Label: 'The best',
  scaleCol2Text:
    "Some products are an easy call when you just don't want to overpay. Others are for those who compare specs, performance and value, and want the best.",
  stats: [
    { value: 1400, suffix: '+', label: 'product numbers' },
    { value: 26, suffix: '', label: 'stores in Denmark' },
    { value: 227, suffix: '+', label: 'stores in Europe' },
  ],
  specialistsHeadline: 'Masters of the trade, majoring in STROXX',
  guaranteeHeadline: '*100%* satisfaction \n or your money back.',
  guaranteeText:
    "We'll stand behind it. If you're not happy with your STROXX tool, you get your money back. So there's not much to think over. Just get started.",
  monthHeadline: 'Check it out.',
  monthBlue: 'Green line laser 3D',
  monthText:
    'Every month, one tool gets the full story: why it wins, where it earns its keep, and what the trade says. The rest of the month takes care of itself.',
  categoriesHeadline: "All you'll *need.* Category \n by category.",
  ctaLabel: 'Buy STROXX at Carl Ras',
};

export async function getHomePage(): Promise<HomeCopy> {
  try {
    const { data } = await sanityFetch({ query: '*[_type == "homePage"][0]' });
    if (!data) return HOME_DEFAULTS;
    const d = data as Record<string, any>;
    const merged: Record<string, any> = { ...HOME_DEFAULTS, _id: d._id };
    for (const key of Object.keys(HOME_DEFAULTS) as (keyof HomeCopy)[]) {
      const v = d[key];
      if (key === 'stats') {
        if (Array.isArray(v) && v.length) {
          merged.stats = v.map((x: Record<string, any>) => ({
            value: typeof x.value === 'number' ? x.value : 0,
            suffix: x.suffix ?? '',
            label: x.label ?? '',
          }));
        }
      } else if (typeof v === 'string' && v.trim()) {
        merged[key] = v;
      }
    }
    return merged as HomeCopy;
  } catch {
    return HOME_DEFAULTS;
  }
}

/* ── Stores ─────────────────────────────────────────────────────────────── */

/** Store documents from the CMS, mapped to the finder's Store type. Falls
 *  back to the static Webflow snapshot while the dataset has no stores.
 *  Inactive stores and malformed coordinates are dropped. */
export async function getStores(): Promise<Store[]> {
  try {
    const { data } = await sanityFetch({
      query: '*[_type == "store" && active != false] | order(name asc)',
    });
    const docs = (data ?? []) as Record<string, any>[];
    if (!docs.length) return fallbackStores;
    const mapped = docs
      .map((d): Store | null => {
        const lat = Number(d.lat);
        const lng = Number(d.lng);
        if (!d.name || !Number.isFinite(lat) || !Number.isFinite(lng)) return null;
        return {
          id: stegaClean(d._id) ?? String(d._id),
          name: d.name,
          brand: (stegaClean(d.brand) as StoreBrand) || 'Carl Ras',
          region: (stegaClean(d.region) as StoreRegion) || 'Sjælland',
          address: d.address ?? '',
          zipCity: d.zipCity ?? '',
          lat,
          lng,
          maps: d.mapsUrl ?? '',
          manager: {
            name: d.managerName ?? '',
            email: d.managerEmail ?? '',
            phone: d.managerPhone ?? '',
            photo: d.managerPhoto ?? '',
          },
          monThu: [Number(d.openMonThu ?? 7), Number(d.closeMonThu ?? 16)],
          fri: [Number(d.openFri ?? 7), Number(d.closeFri ?? 15)],
          weekendClosed: d.weekendClosed !== false,
          festool: !!d.festool,
          sikring: !!d.sikring,
          aktive3: !!d.aktive3,
        };
      })
      .filter(Boolean) as Store[];
    return mapped.length ? mapped : fallbackStores;
  } catch {
    return fallbackStores;
  }
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
