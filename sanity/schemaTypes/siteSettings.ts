import { defineArrayMember, defineField, defineType } from 'sanity';
import SeoPreviewField from '../SeoPreviewField';
import { langLabel, langPath } from '../lib/langLabel';

const linkArray = (name: string, title: string, description: string, group: string) =>
  defineField({
    name,
    title,
    description,
    group,
    type: 'array',
    validation: (r) => r.max(8),
    of: [
      defineArrayMember({
        type: 'object',
        name: 'navLink',
        fields: [
          defineField({ name: 'label', title: 'Label', type: 'string', validation: (r) => r.required() }),
          defineField({
            name: 'href',
            title: 'Link',
            type: 'string',
            description: 'Internal path (/products) or full URL (https://...).',
            validation: (r) => r.required(),
          }),
        ],
        preview: { select: { title: 'label', subtitle: 'href' } },
      }),
    ],
  });

/** One document per market. Everything an editor may legitimately change
 *  without a deploy lives here (production plan section 8). API keys and
 *  secrets NEVER go in the CMS; they live in the hosting environment.
 *
 *  Editor UX: groups are ordered everyday-first and the document opens on
 *  Menu + footer (default: true), never on the "All fields" wall. The
 *  Microcopy group is subdivided into collapsible per-page fieldsets (same
 *  pattern as market.ts / store.ts). Display metadata only: no field name,
 *  no type changed, stored data loads unchanged. */
export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site settings',
  type: 'document',
  groups: [
    { name: 'nav', title: 'Menu + footer', default: true },
    { name: 'copy', title: 'Microcopy' },
    { name: 'seo', title: 'SEO + AI engines' },
    { name: 'newsletter', title: 'Newsletter' },
    { name: 'integrations', title: 'Technical (developer)' },
  ],
  fieldsets: [
    {
      name: 'fsFooter',
      title: 'Footer',
      description: 'The words in the footer at the bottom of every page.',
      options: { collapsible: true, collapsed: true },
    },
    {
      name: 'fsChat',
      title: 'Chat',
      description: 'The floating "Talk to a specialist" chat: its two switches and every line of its copy, together.',
      options: { collapsible: true, collapsed: true },
    },
    {
      name: 'fsProClub',
      title: 'Pro Club (product pages)',
      description: 'The Pro Club signup box shown on product pages.',
      options: { collapsible: true, collapsed: true },
    },
    {
      name: 'fsNews',
      title: 'News page',
      description: 'The news index at /news.',
      options: { collapsible: true, collapsed: true },
    },
    {
      name: 'fsNewsletterCopy',
      title: 'Newsletter form',
      description: 'Messages shown by the signup form itself (the form words and popup rules live on the Newsletter tab; the provider and keys live on the Market document, Settings, then Markets).',
      options: { collapsible: true, collapsed: true },
    },
    {
      name: 'fsProducts',
      title: 'Products page',
      description: 'The product overview at /products.',
      options: { collapsible: true, collapsed: true },
    },
    {
      name: 'fsStores',
      title: 'Stores page',
      description: 'The store finder at /stores.',
      options: { collapsible: true, collapsed: true },
    },
    {
      name: 'fsService',
      title: 'Service page',
      description: 'The whole Service and Support page at /service: guarantee, returns, documents, contact and FAQ.',
      options: { collapsible: true, collapsed: true },
    },
    {
      name: 'fsSupportIndex',
      title: 'Support index',
      description: 'The support overview at /support (the page the packaging QR codes point into).',
      options: { collapsible: true, collapsed: true },
    },
    {
      name: 'fsTrades',
      title: 'Trades page',
      description: 'The trades overview at /trades.',
      options: { collapsible: true, collapsed: true },
    },
    {
      name: 'fsNotFound',
      title: '404 page',
      description: 'What visitors read when a link leads nowhere.',
      options: { collapsible: true, collapsed: true },
    },
  ],
  fields: [
    defineField({ name: 'language', type: 'string', readOnly: true, hidden: true }),

    /* ── Menu + footer: the everyday group, the document opens here ── */
    defineField({
      name: 'logo',
      title: 'Site logo (header)',
      type: 'image',
      group: 'nav',
      description:
        'Swap the STROXX logo in the top header for a special occasion, e.g. a campaign or seasonal version. Leave empty for the standard STROXX logo (it reverts automatically when you remove this). GUIDELINES: use the WHITE / light version, the header is dark. SVG is best (crisp at any size); otherwise a PNG with a transparent background. Keep the standard lockup proportions, the framed wordmark over the Proud Professionals bar (about 2.6:1). It displays about 44px tall, so a PNG should be at least ~180px tall (4x) to stay sharp on retina screens. Leave clear space around it and add no shadows or effects. Under ~200KB.',
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt text',
          type: 'string',
          initialValue: 'STROXX',
          description: 'Read by screen readers. Keep it as the brand name unless the special logo says something different.',
        }),
      ],
    }),

    linkArray('navLinks', 'Menu: top navigation links',
      'The links in the top navigation, in order. The first four show on desktop; all show in the mobile menu. Leave empty for the built-in menu.', 'nav'),
    defineField({
      name: 'newsEnabled',
      title: 'News section enabled',
      type: 'boolean',
      initialValue: true,
      group: 'nav',
      description:
        'Toggle off for markets that do not blog: /news and every article return "page not found" and leave the sitemap. Remember to remove News menu and footer links too.',
    }),
    linkArray('footerPageLinks', 'Footer: "Pages" column links', 'Leave empty for the built-in list.', 'nav'),
    linkArray('footerBuyLinks', 'Footer: "Buy" column links', 'Leave empty for the built-in list.', 'nav'),

    /* Dealer identity + contact live on the MARKET document (Settings → Markets):
       dealer name, Buy-at CTA link, customer service phone, footer legal line.
       The old retailerName / retailerLogo / retailerLogoHref / supportPhone /
       legalLine fields here were dead or duplicated that source, removed
       2026-07-11 (see the dealer-contact row in DEPENDENCIES.md). Only the
       localized HOURS text stays here: it is per-language display copy. */
    defineField({
      name: 'supportHours',
      title: 'Customer service hours',
      description:
        'Localized hours text shown in the footer under the dealer’s phone. The phone itself, the dealer name and the footer legal line come from the Market document (Settings, then Markets). Press Enter for a new line. Leave empty on the international version: the seed:more script clears this field on the English base by design, so the dealer-neutral site never shows one dealer’s hours.',
      type: 'text',
      rows: 2,
      group: 'nav',
    }),

    /* ── Microcopy: every small user-facing text on the site, grouped by
       the page it appears on (collapsible fieldsets) ── */
    defineField({ name: 'footerAbout', title: 'Footer: about paragraph', type: 'text', rows: 3, group: 'copy', fieldset: 'fsFooter',
      description: 'The paragraph under the logo in the footer. Partner names (Meesenburg, Foussier, Lecot) become links automatically.' }),

    defineField({
      name: 'chatEnabled',
      title: 'Show "Talk to a specialist" chat',
      description:
        'OFF hides the chat button on the whole site (the floating blue pill in the corner of every page). Independent of the AI toggle below.',
      type: 'boolean',
      initialValue: true,
      group: 'copy',
      fieldset: 'fsChat',
    }),
    defineField({
      name: 'aiChatEnabled',
      title: 'AI specialist chat',
      description:
        'ON: the chat answers free-form questions with AI (grounded in the site facts; requires the AI key in the hosting environment). OFF: the built-in scripted answers only. The scripted product/store/guarantee answers and the human handoff always remain.',
      type: 'boolean',
      initialValue: false,
      group: 'copy',
      fieldset: 'fsChat',
    }),
    defineField({ name: 'chatFabLabel', title: 'Chat: floating button label', type: 'string', group: 'copy', fieldset: 'fsChat',
      description: 'The text on the floating blue chat pill visitors see in the corner of every page.' }),
    defineField({ name: 'chatPanelHeadline', title: 'Chat: panel headline', type: 'string', group: 'copy', fieldset: 'fsChat',
      description: 'The headline at the top of the chat panel once it opens.' }),
    defineField({ name: 'chatPanelText', title: 'Chat: panel text', type: 'text', rows: 2, group: 'copy', fieldset: 'fsChat',
      description: 'The short line under the chat panel headline.' }),
    defineField({ name: 'chatGreeting', title: 'Chat: greeting message', type: 'text', rows: 2, group: 'copy', fieldset: 'fsChat',
      description: 'The first message the chat sends when a visitor opens it.' }),
    defineField({ name: 'chatFallback', title: 'Chat: fallback answer', type: 'text', rows: 2, group: 'copy', fieldset: 'fsChat',
      description: 'Shown when neither the built-in answers nor the AI can help. Should offer the human handoff ("type yes").' }),

    defineField({ name: 'proClubHeadline', title: 'Pro Club: headline', type: 'string', group: 'copy', fieldset: 'fsProClub',
      description: 'The headline of the Pro Club signup box on product pages.' }),
    defineField({ name: 'proClubText', title: 'Pro Club: text', type: 'text', rows: 2, group: 'copy', fieldset: 'fsProClub',
      description: 'The signup box on product pages. Submissions go to the Newsletter platform.' }),

    defineField({ name: 'newsHeadline', title: 'News: index headline', type: 'string', group: 'copy', fieldset: 'fsNews',
      description: 'The big headline at the top of the news page (/news). *word* = blue accent.' }),
    defineField({ name: 'newsIntro', title: 'News: intro line', type: 'text', rows: 2, group: 'copy', fieldset: 'fsNews',
      description: 'The line under the news page headline.' }),
    defineField({ name: 'newsEmpty', title: 'News: empty-state text', type: 'string', group: 'copy', fieldset: 'fsNews',
      description: 'Shown on the news page while no articles are published yet.' }),

    defineField({ name: 'newsletterSuccess', title: 'Newsletter: success message', type: 'string', group: 'copy', fieldset: 'fsNewsletterCopy',
      description: 'The thank-you line after a successful signup, wherever the form appears (footer, signup band, popup, landing pages).' }),

    defineField({ name: 'produkterHeadline', title: 'Products page: headline', type: 'string', group: 'copy', fieldset: 'fsProducts',
      description: 'The headline at the top of the product overview (/products). *word* = blue accent.' }),
    defineField({ name: 'produkterIntro', title: 'Products page: intro', type: 'text', rows: 2, group: 'copy', fieldset: 'fsProducts',
      description: 'The line under the products page headline.' }),

    defineField({ name: 'butikkerHeadlineStores', title: 'Stores page: headline (stores tab)', type: 'string', group: 'copy', fieldset: 'fsStores',
      description: 'The headline on the store finder (/stores) when the stores tab is active. *word* = blue accent.' }),

    defineField({ name: 'serviceHeadline', title: 'Service page: headline', type: 'string', group: 'copy', fieldset: 'fsService',
      description: 'The headline at the top of the Service and Support page (/service). *word* = blue accent.' }),
    defineField({ name: 'serviceIntro', title: 'Service page: intro', type: 'text', rows: 2, group: 'copy', fieldset: 'fsService',
      description: 'The line under the Service page headline.' }),
    defineField({ name: 'serviceGuaranteeHeading', title: 'Service: guarantee heading', type: 'string', group: 'copy', fieldset: 'fsService',
      description: 'The heading of the guarantee block on the Service page.' }),
    defineField({ name: 'serviceGuaranteeBody', title: 'Service: guarantee body', type: 'text', rows: 3, group: 'copy', fieldset: 'fsService',
      description: 'The guarantee explanation on the Service page. Keep it identical to the printed guarantee terms.' }),
    defineField({ name: 'serviceReturnsHeading', title: 'Service: returns heading', type: 'string', group: 'copy', fieldset: 'fsService',
      description: 'The heading above the return steps on the Service page.' }),
    defineField({ name: 'serviceReturnSteps', title: 'Service: return steps', type: 'array', group: 'copy', fieldset: 'fsService',
      description: 'The numbered how-to-return steps on the Service page, in order.',
      of: [{ type: 'object', name: 'step',
        fields: [
          defineField({ name: 'title', title: 'Step title', type: 'string' }),
          defineField({ name: 'body', title: 'Step text', type: 'text', rows: 2 }),
        ], preview: { select: { title: 'title', subtitle: 'body' } } }] }),
    defineField({ name: 'serviceDocsHeading', title: 'Service: documents heading', type: 'string', group: 'copy', fieldset: 'fsService',
      description: 'The heading above the document downloads on the Service page.' }),
    defineField({ name: 'serviceDocs', title: 'Service: document links', type: 'array', group: 'copy', fieldset: 'fsService',
      description: 'The downloadable documents listed on the Service page (guarantee terms, return form and the like).',
      of: [{ type: 'object', name: 'doc',
        fields: [
          defineField({ name: 'label', title: 'Label', type: 'string' }),
          defineField({ name: 'href', title: 'Link (path or https URL)', type: 'string' }),
        ], preview: { select: { title: 'label', subtitle: 'href' } } }] }),
    defineField({ name: 'serviceDocsPending', title: 'Service: documents pending note', type: 'text', rows: 2, group: 'copy', fieldset: 'fsService',
      description: 'Shown in the documents block while no documents are linked yet.' }),
    defineField({ name: 'serviceContactHeading', title: 'Service: contact heading', type: 'string', group: 'copy', fieldset: 'fsService',
      description: 'The heading of the contact block on the Service page.' }),
    defineField({ name: 'serviceContactBody', title: 'Service: contact body', type: 'text', rows: 3, group: 'copy', fieldset: 'fsService',
      description: 'The contact text on the Service page. Include the phone number and hours here.' }),
    defineField({ name: 'serviceFaqEyebrow', title: 'Service: FAQ eyebrow', type: 'string', group: 'copy', fieldset: 'fsService',
      description: 'The small line above the FAQ heading on the Service page.' }),
    defineField({ name: 'serviceFaqHeading', title: 'Service: FAQ heading', type: 'string', group: 'copy', fieldset: 'fsService',
      description: 'The FAQ heading on the Service page. *word* = blue accent.' }),
    defineField({ name: 'serviceFaq', title: 'Service: FAQ', type: 'array', group: 'copy', fieldset: 'fsService',
      description: 'The questions and answers in the FAQ on the Service page, in order. Each can carry an optional link.',
      of: [{ type: 'object', name: 'qa',
        fields: [
          defineField({ name: 'question', title: 'Question', type: 'string' }),
          defineField({ name: 'answer', title: 'Answer', type: 'text', rows: 3 }),
          defineField({ name: 'linkText', title: 'Link text (optional)', type: 'string' }),
          defineField({ name: 'linkUrl', title: 'Link URL (optional)', type: 'string' }),
        ], preview: { select: { title: 'question' } } }] }),

    defineField({ name: 'supportIndexHeadline', title: 'Support index: headline', type: 'string', group: 'copy', fieldset: 'fsSupportIndex',
      description: 'The headline at the top of the support overview (/support). *word* = blue accent.' }),
    defineField({ name: 'supportIndexIntro', title: 'Support index: intro', type: 'text', rows: 2, group: 'copy', fieldset: 'fsSupportIndex',
      description: 'The line under the support index headline.' }),

    /* the trades overview copy moved to its own page document (Pages -> Trades overview) on 2026-07-12 */

    defineField({ name: 'notFoundHeadline', title: '404 page: headline', type: 'string', group: 'copy', fieldset: 'fsNotFound',
      description: 'The headline on the "page not found" page.' }),
    defineField({ name: 'notFoundText', title: '404 page: text', type: 'string', group: 'copy', fieldset: 'fsNotFound',
      description: 'The friendly line under the 404 headline that sends visitors somewhere useful.' }),

    /* ── SEO + AI engines ── */
    defineField({
      name: 'seoTitle',
      title: 'SEO: site title',
      description: 'The default browser-tab/Google title. Subpages append their own name to it.',
      type: 'string',
      group: 'seo',
      validation: (r) => r.max(60).warning('Google cuts titles around 60 characters, so the end of this one will be truncated in results'),
    }),
    defineField({
      name: 'seoDescription',
      title: 'SEO: site description',
      description: 'The default description Google and social shares show when a page has no specific one. Aim for 150 to 160 characters.',
      type: 'text',
      rows: 3,
      group: 'seo',
      validation: (r) => r.max(160).warning('Google cuts descriptions around 155 to 160 characters, so the end of this one will be truncated in results'),
    }),
    defineField({
      name: 'seoPreview',
      title: 'Preview (live)',
      description: 'How the site-wide defaults look in a Google result and a shared link. Built from the SEO fields as you type (the shared-link image is the share image path on the Technical (developer) tab, managed by the developer); nothing to fill in here.',
      type: 'string',
      readOnly: true,
      group: 'seo',
      components: { input: SeoPreviewField },
    }),
    defineField({
      name: 'llmsTxt',
      title: 'AEO: llms.txt content',
      description:
        'Served at /llms.txt: the brand summary AI answer engines (ChatGPT, Perplexity, Google AI) read. Plain markdown text. Leave empty to use the built-in version.',
      type: 'text',
      rows: 18,
      group: 'seo',
    }),

    /* ── Newsletter: the per-language WORDS of the signup form and its popup
       rules. The operational setup (on/off switch, provider choice, encrypted
       keys, list ID, connection status) moved to the MARKET document
       (Settings, then Markets) 2026-07-11: it is per-market, not per-language,
       and Belgium's two language documents share one market. ── */
    defineField({
      name: 'newsletterHeadline',
      title: 'Footer signup headline',
      type: 'string',
      group: 'newsletter',
      initialValue: 'Sharp offers, no spam.',
      description: 'The headline of the signup form in the footer. NOTE: the provider, its keys and the on/off switch now live on the Market document (Settings, then Markets); this tab holds only the per-language words and popup rules.',
    }),
    defineField({
      name: 'newsletterText',
      title: 'Footer signup text',
      type: 'text',
      rows: 2,
      group: 'newsletter',
      initialValue: 'The monthly lineup and the best of STROXX, straight to your inbox.',
      description: 'The line under the signup headline in the footer.',
    }),
    defineField({
      name: 'newsletterButtonLabel',
      title: 'Signup button label',
      type: 'string',
      group: 'newsletter',
      initialValue: 'Sign up',
      description: 'The label on the signup button, wherever the form appears.',
    }),
    defineField({
      name: 'newsletterBandEnabled',
      title: 'Show the signup band above the footer',
      description: 'The designed full-width signup section on every page, just before the footer.',
      type: 'boolean',
      initialValue: true,
      group: 'newsletter',
    }),
    defineField({
      name: 'newsletterPopupEnabled',
      title: 'Show the signup popup',
      description: 'A modal signup that appears by the rules below. Off by default; popups convert but annoy, use with taste.',
      type: 'boolean',
      initialValue: false,
      group: 'newsletter',
    }),
    defineField({
      name: 'newsletterPopupDelay',
      title: 'Popup: show after (seconds)',
      description: 'Seconds on the page before the popup may appear.',
      type: 'number',
      initialValue: 8,
      group: 'newsletter',
      validation: (r) => r.min(0).max(600),
    }),
    defineField({
      name: 'newsletterPopupScroll',
      title: 'Popup: or after scrolling (%)',
      description: 'Alternatively appears when the visitor has scrolled this far. Whichever rule triggers first wins.',
      type: 'number',
      initialValue: 50,
      group: 'newsletter',
      validation: (r) => r.min(0).max(100),
    }),
    defineField({
      name: 'newsletterPopupFrequencyDays',
      title: 'Popup: at most once per (days)',
      description: 'After dismissing, the visitor is left alone this long. Subscribers never see it again.',
      type: 'number',
      initialValue: 14,
      group: 'newsletter',
      validation: (r) => r.min(1).max(365),
    }),
    defineField({
      name: 'newsletterDisclaimer',
      title: 'Consent line under the form',
      description: 'The short legal line, e.g. what they subscribe to and how to unsubscribe.',
      type: 'string',
      group: 'newsletter',
      initialValue: 'Unsubscribe anytime. We only write when it is worth your time.',
    }),

    /* Tracking + consent (gtmId, cookiebotId) moved to the MARKET document
       (Settings, then Markets) 2026-07-11: one container and one CBID per
       market, never per language. See the per-market tracking row in
       DEPENDENCIES.md and scripts/migrate-market-ops.ts. */

    /* ── Technical (developer): fields the developer manages. Editors can
       read them but nothing here is part of the everyday content work. ── */
    defineField({
      name: 'dataSourcesNote',
      title: 'PIM, DAM and sales data have moved',
      description:
        'The product feed (PIM), the image feed (DAM) and the sales-signal conversation now have their own document, with a status for each: Settings, then "Data sources (PIM, DAM, sales)". They used to sit here as two read-only URL fields, which is exactly where nobody looked for them. Nothing to fill in on this tab. Contract and questions for Carl Ras IT: the handover pack, 01 - IT / CMS and integrations / STROXX PIM-DAM Integration.',
      type: 'string',
      readOnly: true,
      group: 'integrations',
    }),
    defineField({
      name: 'ogImage',
      title: 'SEO: social share image path',
      description: 'The site-wide fallback image for shared links (Open Graph), ideally 1200x630. This one is a file path a developer places in the codebase (e.g. /brand/og.jpg); ask the developer to swap it, which is why it sits on this Technical tab. The live preview on the SEO + AI engines tab shows it in the shared-link card. Individual landing pages and articles can upload their own share image, which overrides this.',
      type: 'string',
      group: 'integrations',
    }),
  ],
  preview: {
    select: { language: 'language' },
    prepare: ({ language }: { language?: string }) => ({
      title: `Site settings (${langLabel(language)})`,
      subtitle: langPath(language) || '/',
    }),
  },
});
