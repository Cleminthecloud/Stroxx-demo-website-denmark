import type { StructureResolver } from 'sanity/structure';
import {
  DocumentsIcon,
  HomeIcon,
  HelpCircleIcon,
  PackageIcon,
  EditIcon,
  UsersIcon,
  PinIcon,
  CogIcon,
  EarthGlobeIcon,
  TranslateIcon,
  ComponentIcon,
  LockIcon,
  DatabaseIcon,
  RocketIcon,
  CalendarIcon,
} from '@sanity/icons';

/** The markets whose permission records get their own filtered list. Kept in
 *  step with lib/markets.ts; a market missing here still appears under
 *  "All records", it just has no shortcut. */
const PERMISSION_MARKETS: [string, string][] = [
  ['dk', 'Denmark'],
  ['de', 'Germany'],
  ['fr', 'France'],
  ['be', 'Belgium'],
  ['int', 'International'],
];

/** Today and the first of this month, resolved when the Studio loads its
 *  structure. Both drive the "what is running now" campaign lists and the
 *  live/archive split on the monthly lineups. */
const TODAY = new Date().toISOString().slice(0, 10);
const MONTH_START = `${TODAY.slice(0, 7)}-01`;

/** One activation row is live when it is switched on and today sits inside its
 *  window. Mirrors windowState() in lib/campaigns.ts, in GROQ. */
const ACTIVE_ROW = 'active == true && (!defined(startDate) || startDate <= $today) && (!defined(endDate) || endDate >= $today)';

const campaignList = (
  S: Parameters<StructureResolver>[0],
  title: string,
  filter: string,
  params: Record<string, string> = {},
) =>
  S.listItem()
    .title(title)
    .child(
      S.documentTypeList('campaign')
        .title(title)
        .apiVersion('2026-07-01')
        .filter(`_type == "campaign" && ${filter}`)
        .params({ today: TODAY, ...params })
        .defaultOrdering([{ field: 'name', direction: 'asc' }]),
    );

const lineupList = (S: Parameters<StructureResolver>[0], title: string, filter: string) =>
  S.listItem()
    .title(title)
    .child(
      S.documentTypeList('monthlyLineup')
        .title(title)
        .apiVersion('2026-07-01')
        .filter(`_type == "monthlyLineup" && ${filter}`)
        .params({ monthStart: MONTH_START })
        .defaultOrdering([{ field: 'activeFrom', direction: 'desc' }]),
    );

const permissionList = (S: Parameters<StructureResolver>[0], title: string, filter: string, params: Record<string, string>) =>
  S.listItem()
    .title(title)
    .child(
      S.documentTypeList('permission')
        .title(title)
        /* apiVersion is required alongside a custom filter (Sanity warns once
           per list without it, and will require it). */
        .apiVersion('2026-07-01')
        .filter(`_type == "permission" && ${filter}`)
        .params(params)
        .defaultOrdering([{ field: 'consentAt', direction: 'desc' }]),
    );

/** Custom Studio structure. The flat ~18-type list is grouped by what an editor
 *  thinks about (pages, support, products, news, proof, stores, settings,
 *  system), so the top level stays calm (~8 items) and related types sit
 *  together. Drilling into a group opens its types in the next column. A divider
 *  puts everyday content above config/system. */
export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      S.listItem()
        .title('Pages')
        .icon(DocumentsIcon)
        .child(
          S.list()
            .title('Pages')
            .items([
              S.documentTypeListItem('homePage').title('Homepage').icon(HomeIcon),
              S.documentTypeListItem('landingPage').title('Campaign / landing pages'),
              S.documentTypeListItem('tradesIndex').title('Trades overview'),
              S.documentTypeListItem('trade').title('Trade pages'),
              /* The monthly engine, split so the month being worked on is never
                 mixed up with the months already published. Past months keep
                 their permanent address at /monthly/YYYY-MM and stay editable
                 here; the site lists them at /monthly/archive. */
              S.listItem()
                .title('Monthly lineup (Månedens STROXX)')
                .icon(CalendarIcon)
                .child(
                  S.list()
                    .title('Monthly lineup')
                    .items([
                      lineupList(S, 'This month and coming up', '!defined(activeFrom) || activeFrom >= $monthStart'),
                      lineupList(S, 'Archive (published months)', 'defined(activeFrom) && activeFrom < $monthStart'),
                      S.divider(),
                      S.documentTypeListItem('monthlyLineup').title('All months'),
                    ]),
                ),
              S.documentTypeListItem('legalPage').title('Legal & guarantee pages'),
            ]),
        ),
      /* Campaigns: the creative once, the schedule per market. Every country
         sees every campaign, shared EU and local alike, and decides in the
         campaign's own "Where and when" table what runs, when, and where on
         its front page. These lists answer the two questions an editor
         actually has: what is running right now, and what is mine. */
      S.listItem()
        .title('Campaigns')
        .icon(RocketIcon)
        .child(
          S.list()
            .title('Campaigns')
            .items([
              campaignList(S, 'Live somewhere now', `count(activations[${ACTIVE_ROW}]) > 0`),
              campaignList(S, 'Scheduled (not started yet)', 'count(activations[active == true && defined(startDate) && startDate > $today]) > 0'),
              campaignList(S, 'Finished', `count(activations[active == true && defined(endDate) && endDate < $today]) > 0 && count(activations[${ACTIVE_ROW}]) == 0`),
              campaignList(S, 'Switched off everywhere', 'count(activations[active == true]) == 0'),
              S.divider(),
              campaignList(S, 'Shared EU campaigns', 'origin == "eu"'),
              ...PERMISSION_MARKETS.map(([code, name]) =>
                campaignList(S, `${name}: running now`, `count(activations[market == $code && ${ACTIVE_ROW}]) > 0`, { code }),
              ),
              S.divider(),
              S.documentTypeListItem('campaign').title('All campaigns'),
            ]),
        ),
      S.listItem()
        .title('Support & QR codes')
        .icon(HelpCircleIcon)
        .child(
          S.list()
            .title('Support & QR codes')
            .items([
              S.documentTypeListItem('supportPage').title('Support pages'),
              S.documentTypeListItem('qrCode').title('QR codes'),
              S.documentTypeListItem('redirect').title('Redirects'),
            ]),
        ),
      S.documentTypeListItem('productAugment').title('Products').icon(PackageIcon),
      S.documentTypeListItem('post').title('News articles').icon(EditIcon),
      S.listItem()
        .title('Social proof & media')
        .icon(UsersIcon)
        .child(
          S.list()
            .title('Social proof & media')
            .items([
              S.documentTypeListItem('specialist').title('Specialists'),
              S.documentTypeListItem('testimonial').title('Testimonials'),
              S.documentTypeListItem('video').title('Films (YouTube)'),
            ]),
        ),
      S.documentTypeListItem('store').title('Stores').icon(PinIcon),
      /* The permission database: one record per person per market, written by
         the site, read-only here. Sits above the divider because it is audience
         data the marketing team looks at, not configuration. */
      S.listItem()
        .title('Permissions (newsletter consent)')
        .icon(LockIcon)
        .child(
          S.list()
            .title('Permissions')
            .items([
              permissionList(S, 'All records', 'true', {}),
              permissionList(S, 'Confirmed (mailable)', 'status == "confirmed"', {}),
              permissionList(S, 'Pending confirmation', 'status == "pending"', {}),
              permissionList(S, 'Unsubscribed', 'status in ["unsubscribed", "suppressed"]', {}),
              S.divider(),
              permissionList(S, 'Behaviour consent given', 'behaviourConsent == true', {}),
              S.divider(),
              ...PERMISSION_MARKETS.map(([code, name]) =>
                permissionList(S, name, 'market == $code', { code }),
              ),
            ]),
        ),
      S.divider(),
      S.listItem()
        .title('Settings')
        .icon(CogIcon)
        .child(
          S.list()
            .title('Settings')
            .items([
              S.documentTypeListItem('siteSettings').title('Site settings'),
              S.documentTypeListItem('market').title('Markets').icon(EarthGlobeIcon),
              /* Singleton: one document describing the systems the site reads
                 from but does not own. Lived as two hidden read-only fields on
                 the Site settings "Technical" tab until 2026-08-27, where
                 nobody could find them. */
              S.listItem()
                .title('Data sources (PIM, DAM, sales)')
                .icon(DatabaseIcon)
                .child(S.document().schemaType('dataSources').documentId('dataSources').title('Data sources (PIM, DAM, sales)')),
            ]),
        ),
      S.listItem()
        .title('System')
        .icon(ComponentIcon)
        .child(
          S.list()
            .title('System')
            .items([
              S.documentTypeListItem('translation.metadata').title('Translation metadata').icon(TranslateIcon),
              S.documentTypeListItem('feedback').title('Feedback (test reports)'),
            ]),
        ),
    ]);
