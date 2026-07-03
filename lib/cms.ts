import { stegaClean } from '@sanity/client/stega';
import { assetUrl } from '@/sanity/lib/image';
import { sanityFetch } from '@/sanity/lib/live';
import { products, Product } from '@/lib/data';
import { SKA } from '@/lib/ska';
import { stores as fallbackStores, Store, StoreBrand, StoreRegion } from '@/lib/stores';
import { HOME_DEFAULTS, type HomeCopy } from '@/lib/home-copy';
import { specialists as fallbackSpecialists, Specialist } from '@/lib/data';
import { testimonials as fallbackTestimonials, Testimonial } from '@/lib/testimonials';
import { videos as fallbackVideos, Video } from '@/lib/videos';

/** CMS access layer with hardcoded fallbacks: if the dataset is empty or
 *  unreachable, every consumer renders exactly what it rendered before the
 *  CMS existed. Same seam philosophy as lib/data.ts. */

export type NavLink = { label?: string; href?: string };
export type SiteSettings = {
  retailerName?: string;
  supportPhone?: string;
  supportHours?: string;
  legalLine?: string;
  gtmId?: string;
  seoTitle?: string;
  seoDescription?: string;
  ogImage?: string;
  llmsTxt?: string;
  navLinks?: NavLink[];
  footerPageLinks?: NavLink[];
  footerBuyLinks?: NavLink[];
  pimFeedUrl?: string;
  damBaseUrl?: string;
  cookiebotId?: string;
  chatEnabled?: boolean;
  aiChatEnabled?: boolean;
};

/** CMS link lists → clean {label, href}[] or null when unset/empty. */
export function cleanLinks(links: NavLink[] | undefined): { label: string; href: string }[] | null {
  const out = (links ?? [])
    .map((l) => ({ label: l.label ?? '', href: stegaClean(l.href) ?? '' }))
    .filter((l) => l.label && l.href);
  return out.length ? out : null;
}

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

export type { HomeCopy, HomeStat } from '@/lib/home-copy';

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
    merged.campaignImages = Array.isArray(d.campaignImages) ? d.campaignImages : [];
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
            photo: assetUrl(d.managerPhotoUpload, 300) ?? d.managerPhoto ?? '',
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

/* ── Specialists, testimonials, films, legal pages ──────────────────────── */

export async function getSpecialists(): Promise<Specialist[]> {
  try {
    const { data } = await sanityFetch({
      query: '*[_type == "specialist" && active != false] | order(name asc)',
    });
    const docs = (data ?? []) as Record<string, any>[];
    if (!docs.length) return fallbackSpecialists;
    const mapped = docs
      .filter((d) => d.name)
      .map((d): Specialist => ({
        name: d.name,
        role: d.role ?? '',
        location: d.location ?? '',
        photo: assetUrl(d.photoUpload, 400) ?? d.photoUrl ?? '',
        quote: d.quote ?? '',
        phone: d.phone ?? '',
        email: d.email ?? '',
        quoteTopic: stegaClean(d.quoteTopic) || undefined,
      }));
    return mapped.length ? mapped : fallbackSpecialists;
  } catch {
    return fallbackSpecialists;
  }
}

/** Same relevance rule as lib/data.specialistForProduct, over any list:
 *  prefer a quote about this product's category, else brand-generic only,
 *  deterministic per slug. */
export function pickSpecialist(list: Specialist[], p: Product): Specialist {
  const hash = p.slug.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const onTopic = list.filter((s) => s.quoteTopic && p.tags.includes(s.quoteTopic));
  const generic = list.filter((s) => !s.quoteTopic);
  const pool = onTopic.length ? onTopic : generic.length ? generic : list;
  return pool[hash % pool.length];
}

export async function getTestimonials(): Promise<Testimonial[]> {
  try {
    const { data } = await sanityFetch({
      query: '*[_type == "testimonial" && active != false] | order(_createdAt asc)',
    });
    const docs = (data ?? []) as Record<string, any>[];
    if (!docs.length) return fallbackTestimonials;
    const mapped = docs
      .filter((d) => d.quote)
      .map((d): Testimonial => ({
        quote: d.quote,
        name: d.name ?? '',
        role: d.role ?? '',
        rating: 5,
        productCode: stegaClean(d.productCode) || undefined,
        trades: ((d.trades ?? []) as string[]).map((t) => stegaClean(t) ?? t),
      }));
    return mapped.length ? mapped : fallbackTestimonials;
  } catch {
    return fallbackTestimonials;
  }
}

export function testimonialsFor(list: Testimonial[], tradeSlug: string): Testimonial[] {
  return list.filter((t) => t.trades.includes(tradeSlug));
}

export async function getVideos(): Promise<Video[]> {
  try {
    const { data } = await sanityFetch({
      query: '*[_type == "video" && active != false] | order(featured desc, _createdAt asc)',
    });
    const docs = (data ?? []) as Record<string, any>[];
    if (!docs.length) return fallbackVideos;
    const mapped = docs
      .filter((d) => d.youtubeId)
      .map((d): Video => ({
        id: stegaClean(d.youtubeId) ?? d.youtubeId,
        title: d.title ?? '',
        by: d.by ?? '',
      }));
    return mapped.length ? mapped : fallbackVideos;
  } catch {
    return fallbackVideos;
  }
}

export type LegalDoc = { title?: string; body?: any };

export async function getLegalPage(slug: string): Promise<LegalDoc | null> {
  try {
    const { data } = await sanityFetch({
      query: '*[_type == "legalPage" && slug == $slug][0]',
      params: { slug },
    });
    return (data as LegalDoc) ?? null;
  } catch {
    return null;
  }
}

/** Landing-page slugs for the sitemap (plain client fetch, no draft context). */
export async function getLandingSlugs(): Promise<string[]> {
  try {
    const { data } = await sanityFetch({
      query: '*[_type == "landingPage" && defined(slug.current)].slug.current',
    });
    return ((data ?? []) as string[]).map((s) => stegaClean(s) ?? s).filter((s) => s && s !== 'proev-det');
  } catch {
    return [];
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
