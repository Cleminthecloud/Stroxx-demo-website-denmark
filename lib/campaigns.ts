/** Multi-market campaign engine.
 *
 *  One campaign document holds the creative (headline, text, photos, buttons).
 *  WHERE and WHEN it runs is decided per market, in the `activations` array:
 *  one row per market, each with its own on/off switch, start and finish date,
 *  homepage placement and running order. So the same EU campaign can be live in
 *  Denmark, scheduled in Germany and switched off in France, and a market can
 *  create a campaign of its own that only ever carries its own row.
 *
 *  Everything here is a pure function of (documents, market code, today) so the
 *  window logic is unit-testable and identical on the server and in the Studio
 *  badges. Dates are compared as YYYY-MM-DD strings, the same convention
 *  getSka() uses for the monthly lineup: no timezone drift, a campaign starts
 *  on its start date and runs through the whole of its end date.
 */

/** Where a campaign shows on the homepage for a given market. */
export type CampaignPlacement = 'band' | 'strip' | 'page';

export type CampaignActivation = {
  /** Market code from lib/markets.ts: dk, de, fr, be, int. */
  market?: string;
  active?: boolean;
  /** YYYY-MM-DD. Empty = no start limit (running since forever). */
  startDate?: string;
  /** YYYY-MM-DD, inclusive. Empty = no finish date (runs until switched off). */
  endDate?: string;
  placement?: CampaignPlacement;
  /** 1 shows first. Empty sorts last. */
  order?: number;
};

export type CampaignDoc = {
  _id?: string;
  name?: string;
  language?: string;
  /** Who owns the creative: 'eu' for a shared campaign, else a market code. */
  origin?: string;
  eyebrow?: string;
  headline?: string;
  text?: string;
  primaryLabel?: string;
  primaryHref?: string;
  secondaryLabel?: string;
  secondaryHref?: string;
  /** Resolved image URLs (Sanity uploads run through assetUrl before they get here). */
  images?: string[];
  activations?: CampaignActivation[];
};

/** A campaign resolved for one market: the doc plus the row that made it live. */
export type LiveCampaign = CampaignDoc & {
  placement: CampaignPlacement;
  order: number;
  startDate?: string;
  endDate?: string;
};

export type WindowState = 'off' | 'scheduled' | 'live' | 'ended';

/** Today as YYYY-MM-DD, the comparison key for every date in this module. */
export const isoToday = (d: Date = new Date()): string => d.toISOString().slice(0, 10);

/** Normalise anything date-ish to YYYY-MM-DD, or undefined when unusable.
 *  Sanity `date` fields already arrive as YYYY-MM-DD; `datetime` fields and
 *  hand-typed values arrive longer, so we clip rather than reject. */
function day(value?: string): string | undefined {
  if (typeof value !== 'string') return undefined;
  const s = value.trim().slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : undefined;
}

/** What state one market's activation row is in today. Drives both the site
 *  and the "Live now / Scheduled / Ended" badges an editor sees in the Studio. */
export function windowState(a: CampaignActivation | undefined, today: string = isoToday()): WindowState {
  if (!a?.active) return 'off';
  const start = day(a.startDate);
  const end = day(a.endDate);
  if (start && today < start) return 'scheduled';
  if (end && today > end) return 'ended';
  return 'live';
}

/** The activation row for one market, if the campaign has one. */
export const activationFor = (doc: CampaignDoc, market: string): CampaignActivation | undefined =>
  (doc.activations ?? []).find((a) => a.market === market);

/** Every campaign live in this market today, in running order.
 *  Sort: order ascending (1 first, empty last), then the most recently started
 *  campaign, then name, so the result is stable across renders. */
export function liveCampaigns(
  docs: CampaignDoc[],
  market: string,
  today: string = isoToday(),
): LiveCampaign[] {
  return docs
    .map((doc): LiveCampaign | null => {
      const a = activationFor(doc, market);
      if (windowState(a, today) !== 'live' || !a) return null;
      return {
        ...doc,
        placement: (a.placement ?? 'band') as CampaignPlacement,
        order: typeof a.order === 'number' ? a.order : Number.MAX_SAFE_INTEGER,
        startDate: day(a.startDate),
        endDate: day(a.endDate),
      };
    })
    .filter((c): c is LiveCampaign => c !== null)
    .sort(
      (x, y) =>
        x.order - y.order ||
        (y.startDate ?? '').localeCompare(x.startDate ?? '') ||
        (x.name ?? '').localeCompare(y.name ?? ''),
    );
}

/** The campaigns that take the big homepage photo band. Several at once is
 *  supported on purpose: the band rotates through them, each with its own
 *  photos and copy. */
export const bandCampaigns = (live: LiveCampaign[]): LiveCampaign[] => live.filter((c) => c.placement === 'band');

/** The campaigns that show as the slim promo row instead of the band. */
export const stripCampaigns = (live: LiveCampaign[]): LiveCampaign[] => live.filter((c) => c.placement === 'strip');
