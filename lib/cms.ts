import { stegaClean } from '@sanity/client/stega';
import { assetUrl } from '@/sanity/lib/image';
import { sanityFetch } from '@/sanity/lib/live';
import { products, Product } from '@/lib/data';
import { SKA } from '@/lib/ska';
import { stores as fallbackStores, Store, StoreBrand, StoreCountry } from '@/lib/stores';
import { HOME_DEFAULTS, type HomeCopy } from '@/lib/home-copy';
import { specialists as fallbackSpecialists, Specialist } from '@/lib/data';
import { testimonials as fallbackTestimonials, Testimonial } from '@/lib/testimonials';
import { videos as fallbackVideos, Video } from '@/lib/videos';
import { trades as fallbackTrades, Trade } from '@/lib/trades';
import { markets as fallbackMarkets, Market } from '@/lib/markets';
export type { Market } from '@/lib/markets';
import { getLocale } from '@/lib/locale';

/** CMS access layer with hardcoded fallbacks: if the dataset is empty or
 *  unreachable, every consumer renders exactly what it rendered before the
 *  CMS existed. Same seam philosophy as lib/data.ts. */

export type NavLink = { label?: string; href?: string };
export type SiteSettings = {
  retailerName?: string;
  retailerLogo?: unknown; // Sanity image; render via assetUrl()
  retailerLogoHref?: string;
  logo?: unknown; // Sanity image, optional header-logo override; render via assetUrl()
  supportPhone?: string;
  supportHours?: string;
  legalLine?: string;
  gtmId?: string;
  seoTitle?: string;
  seoDescription?: string;
  ogImage?: string;
  newsEnabled?: boolean;
  llmsTxt?: string;
  navLinks?: NavLink[];
  footerPageLinks?: NavLink[];
  footerBuyLinks?: NavLink[];
  pimFeedUrl?: string;
  damBaseUrl?: string;
  cookiebotId?: string;
  chatEnabled?: boolean;
  aiChatEnabled?: boolean;
  newsletterEnabled?: boolean;
  newsletterProvider?: string;
  newsletterListId?: string;
  /* provider credentials — encrypted ciphertext (see lib/newsletter-secrets) */
  mailchimpApiKey?: string;
  klaviyoApiKey?: string;
  marketoBaseUrl?: string;
  marketoClientId?: string;
  marketoClientSecret?: string;
  newsletterWebhookUrl?: string;
  newsletterHeadline?: string;
  newsletterText?: string;
  newsletterButtonLabel?: string;
  newsletterDisclaimer?: string;
  newsletterBandEnabled?: boolean;
  newsletterPopupEnabled?: boolean;
  newsletterPopupDelay?: number;
  newsletterPopupScroll?: number;
  newsletterPopupFrequencyDays?: number;
  /* microcopy */
  footerAbout?: string;
  chatFabLabel?: string;
  chatPanelHeadline?: string;
  chatPanelText?: string;
  chatGreeting?: string;
  chatFallback?: string;
  proClubHeadline?: string;
  proClubText?: string;
  newsHeadline?: string;
  newsIntro?: string;
  newsEmpty?: string;
  newsletterSuccess?: string;
  produkterHeadline?: string;
  produkterIntro?: string;
  butikkerHeadlineStores?: string;
  butikkerHeadlineSpecialists?: string;
  serviceHeadline?: string;
  serviceIntro?: string;
  serviceGuaranteeHeading?: string;
  serviceGuaranteeBody?: string;
  serviceReturnsHeading?: string;
  serviceReturnSteps?: { title?: string; body?: string }[];
  serviceDocsHeading?: string;
  serviceDocs?: { label?: string; href?: string }[];
  serviceDocsPending?: string;
  serviceContactHeading?: string;
  serviceContactBody?: string;
  serviceFaqEyebrow?: string;
  serviceFaqHeading?: string;
  serviceFaq?: { question?: string; answer?: string; linkText?: string; linkUrl?: string }[];
  supportIndexHeadline?: string;
  supportIndexIntro?: string;
  fagHeadline?: string;
  fagIntro?: string;
  notFoundHeadline?: string;
  notFoundText?: string;
};

/** Market registry: the international reference + the dealer markets. Empty/
 *  unreachable dataset falls back to lib/markets.ts, same seam as everything else. */
export async function getMarkets(): Promise<Market[]> {
  try {
    const { data } = await sanityFetch({
      query:
        '*[_type == "market"] | order(order asc){ _id, name, "code": code.current, languages, defaultLanguage, isReference, active, dealerName, dealerCtaUrl, supportPhone, supportHours, legalLinks[]{ label, href }, order }',
    });
    return Array.isArray(data) && data.length ? (data as Market[]) : fallbackMarkets;
  } catch {
    return fallbackMarkets;
  }
}

/** CMS link lists → clean {label, href}[] or null when unset/empty. */
export function cleanLinks(links: NavLink[] | undefined): { label: string; href: string }[] | null {
  const out = (links ?? [])
    .map((l) => ({ label: l.label ?? '', href: stegaClean(l.href) ?? '' }))
    .filter((l) => l.label && l.href);
  return out.length ? out : null;
}

/** The active content language for this request (from the middleware header),
 *  falling back to the English reference. */
async function langId(): Promise<string> {
  return (await getLocale()).id;
}

export async function getSiteSettings(): Promise<SiteSettings | null> {
  try {
    const lang = await langId();
    let { data } = await sanityFetch({ query: '*[_type == "siteSettings" && language == $lang][0]', params: { lang } });
    if (!data && lang !== 'en') ({ data } = await sanityFetch({ query: '*[_type == "siteSettings" && language == "en"][0]' }));
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
  ogImage?: unknown; // Sanity image; render via assetUrl()
  sections?: LandingSection[];
};

export async function getLandingPage(slug: string): Promise<LandingDoc | null> {
  try {
    const { data } = await sanityFetch({
      // Dereference the film-section's picked films so the renderer gets their
      // youtubeId/title/by (empty = section falls back to all active films).
      query:
        '*[_type == "landingPage" && slug.current == $slug][0]{ ..., sections[]{ ..., _type == "videoProof" => { "films": films[]->{ _id, youtubeId, title, by } } } }',
      params: { slug },
    });
    return (data as LandingDoc) ?? null;
  } catch {
    return null;
  }
}

/* ── News/blog ──────────────────────────────────────────────────────────── */

export type PostDoc = {
  _id?: string;
  title?: string;
  slug?: { current?: string };
  publishedAt?: string;
  heroImage?: unknown; // Sanity image (+alt field); render via assetUrl()
  excerpt?: string;
  body?: any[];
  tags?: string[];
  relatedSkus?: string[];
  seoTitle?: string;
  seoDescription?: string;
  ogImage?: unknown;
};

/** Newest first. Empty array when the CMS is empty/unreachable: the index
 *  renders a friendly empty state, never an error. */
export async function getPosts(): Promise<PostDoc[]> {
  try {
    const { data } = await sanityFetch({
      query: '*[_type == "post" && defined(slug.current)] | order(publishedAt desc)',
    });
    return Array.isArray(data) ? (data as PostDoc[]) : [];
  } catch {
    return [];
  }
}

export async function getPost(slug: string): Promise<PostDoc | null> {
  try {
    const { data } = await sanityFetch({
      query: '*[_type == "post" && slug.current == $slug][0]',
      params: { slug },
    });
    return (data as PostDoc) ?? null;
  } catch {
    return null;
  }
}

/* ── Support & downloads pages ──────────────────────────────────────────── */

export type SupportDownload = { label?: string; note?: string; language?: string; url?: string; ext?: string; size?: number; videoUrl?: string; videoMime?: string; videoSize?: number };
export type SupportGroup = { heading?: string; items?: SupportDownload[] };
export type SupportPageDoc = {
  _id?: string;
  title?: string;
  slug?: { current?: string };
  intro?: string;
  groups?: SupportGroup[];
  seoTitle?: string;
  seoDescription?: string;
};

const SUPPORT_PROJECTION = `{
  _id, title, slug, intro, seoTitle, seoDescription,
  groups[]{ heading, items[]{ label, note, language,
    "url": file.asset->url, "ext": file.asset->extension, "size": file.asset->size,
    "videoUrl": video.asset->url, "videoMime": video.asset->mimeType, "videoSize": video.asset->size } }
}`;

/** All support pages (for the /support index and the sitemap). Empty array
 *  when the CMS is empty/unreachable, same contract as getPosts. */
export async function getSupportPages(): Promise<SupportPageDoc[]> {
  try {
    const lang = await langId();
    const q = (l: string) => `*[_type == "supportPage" && language == "${l}" && defined(slug.current)] | order(title asc) ${SUPPORT_PROJECTION}`;
    let { data } = await sanityFetch({ query: q(lang) });
    if ((!Array.isArray(data) || !data.length) && lang !== 'en') ({ data } = await sanityFetch({ query: q('en') }));
    return Array.isArray(data) ? (data as SupportPageDoc[]) : [];
  } catch {
    return [];
  }
}

export async function getSupportPage(slug: string): Promise<SupportPageDoc | null> {
  try {
    const lang = await langId();
    let { data } = await sanityFetch({
      query: `*[_type == "supportPage" && slug.current == $slug && language == $lang][0] ${SUPPORT_PROJECTION}`,
      params: { slug, lang },
    });
    if (!data && lang !== 'en') ({ data } = await sanityFetch({
      query: `*[_type == "supportPage" && slug.current == $slug && language == "en"][0] ${SUPPORT_PROJECTION}`,
      params: { slug },
    }));
    return (data as SupportPageDoc) ?? null;
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
    const lang = await langId();
    const query =
      '*[_type == "homePage" && language == $lang][0]{..., "campaignSlug": campaignLink->slug.current, "films": films[]->{ _id, youtubeId, title, by }}';
    let { data } = await sanityFetch({ query, params: { lang } });
    if (!data && lang !== 'en') ({ data } = await sanityFetch({ query, params: { lang: 'en' } }));
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
      } else if (typeof v === 'boolean') {
        /* section switches: explicit editor choice wins, absent keeps the default (on) */
        merged[key] = v;
      }
    }
    merged.campaignImages = Array.isArray(d.campaignImages) ? d.campaignImages : [];
    merged.films = ((d.films ?? []) as Record<string, any>[])
      .filter((f) => f?.youtubeId)
      .map((f): Video => ({
        id: stegaClean(f.youtubeId) ?? f.youtubeId,
        title: stegaClean(f.title) ?? f.title ?? '',
        by: stegaClean(f.by) ?? f.by ?? '',
      }));
    const campaignSlug = typeof d.campaignSlug === 'string' ? stegaClean(d.campaignSlug).trim() : '';
    merged.campaignHref = campaignSlug ? `/kampagne/${campaignSlug}` : '/proev-det';
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
          country: (stegaClean(d.country) as StoreCountry) || 'dk',
          region: stegaClean(d.region) || undefined,
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
          specialist: d.specialist?.name
            ? {
                name: d.specialist.name,
                role: stegaClean(d.specialist.role) || undefined,
                email: d.specialist.email ?? '',
                phone: d.specialist.phone ?? '',
                photo: assetUrl(d.specialist.photoUpload, 300) ?? d.specialist.photo ?? '',
              }
            : undefined,
          monThu: [Number(d.openMonThu ?? 7), Number(d.closeMonThu ?? 16)],
          fri: [Number(d.openFri ?? 7), Number(d.closeFri ?? 15)],
          weekendClosed: d.weekendClosed !== false,
          festool: !!d.festool,
          sikring: !!d.sikring,
          aktive3: !!d.aktive3,
        };
      })
      .filter(Boolean) as Store[];
    let out = mapped.length ? mapped : fallbackStores;
    // Market scope: international shows every country (the European reach); a
    // local market shows its own country; fallback is all-countries-all-stores.
    try {
      const locale = await getLocale();
      if (locale.market && locale.market !== 'int') {
        const scoped = out.filter((s) => s.country === locale.market);
        if (scoped.length) out = scoped;
      }
    } catch {
      /* keep all */
    }
    return out;
  } catch {
    return fallbackStores;
  }
}

/* Brand guide page (/brand) is fully code-owned, no CMS document. */

/* ── Trades (fag pages) ─────────────────────────────────────────────────── */

/** CMS trades with fallback to the hardcoded lib/trades list. title and
 *  accent are stegaCleaned because the page renders the blue part via
 *  title.split(accent), which invisible draft-mode chars would break;
 *  slug and categories are cleaned for matching. */
export async function getTrades(): Promise<Trade[]> {
  try {
    const { data } = await sanityFetch({
      query: '*[_type == "trade" && active != false] | order(order asc, name asc)',
    });
    const docs = (data ?? []) as Record<string, any>[];
    if (!docs.length) return fallbackTrades;
    const mapped = docs
      .map((d): Trade | null => {
        const slug = stegaClean(d.slug?.current) || '';
        if (!slug || !d.name) return null;
        return {
          slug,
          name: d.name,
          title: stegaClean(d.title) || '',
          accent: stegaClean(d.accent) || '',
          blurb: d.blurb ?? '',
          categories: ((d.categories ?? []) as string[]).map((c) => stegaClean(c) ?? c),
          faq: ((d.faq ?? []) as Record<string, any>[])
            .filter((f) => f.q && f.a)
            .map((f) => ({ q: f.q, a: f.a })),
        };
      })
      .filter(Boolean) as Trade[];
    return mapped.length ? mapped : fallbackTrades;
  } catch {
    return fallbackTrades;
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
    // The live lineup is the most recent one whose "Active from" date has
    // passed, so editors can stage next month ahead of time. Lineups with no
    // date stay eligible and fall back to newest-created (backwards compatible).
    const { data } = await sanityFetch({
      query:
        '*[_type == "monthlyLineup" && (!defined(activeFrom) || activeFrom <= $today)] | order(activeFrom desc, _createdAt desc)[0]{ ..., "films": films[]->{ _id, youtubeId, title, by } }',
      params: { today: new Date().toISOString().slice(0, 10) },
    });
    if (!data) return SKA;
    const d = data as Record<string, any>;
    const find = (code?: string) => products.find((p) => p.code === stegaClean(code));
    const hero = find(d.heroSku);
    const cashCows = productsBySkus(d.cashCowSkus);
    const nyheder = ((d.news ?? []) as Record<string, any>[])
      .map((n) => ({ type: (n.label as string) ?? '', product: find(n.sku), pitch: (n.pitch as string) ?? '' }))
      .filter((n) => n.product) as SkaData['nyheder'];
    const films = ((d.films ?? []) as Record<string, any>[])
      .filter((f) => f.youtubeId)
      .map((f): Video => ({
        id: stegaClean(f.youtubeId) ?? f.youtubeId,
        title: stegaClean(f.title) ?? f.title ?? '',
        by: stegaClean(f.by) ?? f.by ?? '',
      }));
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
      films,
    };
  } catch {
    return SKA;
  }
}
