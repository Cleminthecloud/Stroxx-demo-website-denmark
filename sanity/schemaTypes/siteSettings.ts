import { defineArrayMember, defineField, defineType } from 'sanity';
import SeoPreviewField from '../SeoPreviewField';
import NewsletterStatusField from '../NewsletterStatusField';
import EncryptedSecretField from '../EncryptedSecretField';

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
            description: 'Internal path (/produkter) or full URL (https://...).',
            validation: (r) => r.required(),
          }),
        ],
        preview: { select: { title: 'label', subtitle: 'href' } },
      }),
    ],
  });

/** One document per market. Everything an editor may legitimately change
 *  without a deploy lives here (production plan section 8). API keys and
 *  secrets NEVER go in the CMS; they live in the hosting environment. */
export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site settings',
  type: 'document',
  groups: [
    { name: 'contact', title: 'Contact + legal' },
    { name: 'nav', title: 'Menu + footer' },
    { name: 'seo', title: 'SEO + AI engines' },
    { name: 'tracking', title: 'Tracking + consent' },
    { name: 'newsletter', title: 'Newsletter' },
    { name: 'integrations', title: 'Integrations (PIM/DAM/AI)' },
    { name: 'copy', title: 'Microcopy' },
  ],
  fields: [
    defineField({ name: 'retailerName', title: 'Retail partner', type: 'string', initialValue: 'Carl Ras', group: 'contact' }),
    defineField({
      name: 'retailerLogo',
      title: 'Retail partner logo',
      description: 'Shown in the footer next to the credentials. A light/white version works best on the dark background; PNG or SVG with transparency.',
      type: 'image',
      options: { hotspot: true },
      group: 'contact',
    }),
    defineField({
      name: 'retailerLogoHref',
      title: 'Logo link',
      type: 'string',
      description: 'Where a click on the footer logo goes, e.g. https://www.carl-ras.dk. Empty = not clickable.',
      group: 'contact',
    }),
    defineField({
      name: 'supportPhone',
      title: 'Customer service phone',
      description: 'Shown in the footer, nav, chat and guarantee modal.',
      type: 'string',
      group: 'contact',
    }),
    defineField({
      name: 'supportHours',
      title: 'Customer service hours',
      description: 'Press Enter for a new line, e.g. Mon-Thu on one line, Friday on the next.',
      type: 'text',
      rows: 2,
      group: 'contact',
    }),
    defineField({
      name: 'legalLine',
      title: 'Legal line (footer)',
      description: 'Legal entity line for the footer, e.g. company name + CVR.',
      type: 'string',
      group: 'contact',
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
        'Toggle off for markets that do not blog: /nyheder and every article return "page not found" and leave the sitemap. Remember to remove News menu and footer links too.',
    }),
    linkArray('footerPageLinks', 'Footer: "Pages" column links', 'Leave empty for the built-in list.', 'nav'),
    linkArray('footerBuyLinks', 'Footer: "Buy" column links', 'Leave empty for the built-in list.', 'nav'),

    defineField({
      name: 'seoTitle',
      title: 'SEO: site title',
      description: 'The default browser-tab/Google title. Subpages append their own name to it.',
      type: 'string',
      group: 'seo',
    }),
    defineField({
      name: 'seoDescription',
      title: 'SEO: site description',
      description: 'The default description Google and social shares show when a page has no specific one. Aim for 150 to 160 characters.',
      type: 'text',
      rows: 3,
      group: 'seo',
    }),
    defineField({
      name: 'ogImage',
      title: 'SEO: social share image path',
      description: 'Image shown when links are shared (Open Graph). Path under /public, ideally 1200x630, e.g. /brand/og.jpg.',
      type: 'string',
      group: 'seo',
    }),
    defineField({
      name: 'seoPreview',
      title: 'Preview (live)',
      description: 'How the site-wide defaults look in a Google result and a shared link. Built from the fields above as you type; nothing to fill in here.',
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

    defineField({
      name: 'gtmId',
      title: 'Google Tag Manager container ID',
      description: 'Format GTM-XXXXXXX. Loads GTM on every page; leave empty to disable. Manage tags, pixels, analytics AND third-party chat widgets inside GTM, no deploy needed.',
      type: 'string',
      group: 'tracking',
      validation: (r) =>
        r.custom((v) => (!v || /^GTM-[A-Z0-9]+$/i.test(v) ? true : 'Must look like GTM-XXXXXXX')),
    }),
    defineField({
      name: 'cookiebotId',
      title: 'Cookiebot consent banner ID (CBID)',
      description:
        'From manage.cookiebot.com → your domain group ID (a UUID like 12345678-1234-1234-1234-123456789012). Shows the cookie consent banner site-wide and auto-blocks tracking until consent. Required before real traffic in the EU. Leave empty to disable.',
      type: 'string',
      group: 'tracking',
      validation: (r) =>
        r.custom((v) =>
          !v || /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v)
            ? true
            : 'Must be a Cookiebot CBID (UUID format)'
        ),
    }),

    defineField({
      name: 'newsletterStatus',
      title: 'Connection status',
      type: 'string',
      readOnly: true,
      group: 'newsletter',
      components: { input: NewsletterStatusField },
      description: 'Checked against the hosting environment as you open this tab. Nothing to fill in here.',
    }),
    defineField({
      name: 'newsletterEnabled',
      title: 'Newsletter signup on the site',
      description: 'Shows the signup form in the footer (and enables the landing-page signup block). Configure the provider below before switching on.',
      type: 'boolean',
      initialValue: false,
      group: 'newsletter',
    }),
    defineField({
      name: 'newsletterProvider',
      title: 'Email platform',
      description: 'Where signups are sent. Pick your platform, then enter its keys in the fields that appear below. Keys are encrypted in your browser before saving, so it is safe to enter them here.',
      type: 'string',
      group: 'newsletter',
      options: {
        list: [
          { title: 'Mailchimp', value: 'mailchimp' },
          { title: 'Klaviyo', value: 'klaviyo' },
          { title: 'Adobe Marketo', value: 'marketo' },
          { title: 'Other (webhook, e.g. Zapier/Make)', value: 'webhook' },
        ],
        layout: 'radio',
      },
    }),

    /* ── Provider credentials. Encrypted in the browser before saving (see
       EncryptedSecretField); the dataset only ever stores ciphertext. Each is
       shown only when its platform is selected. ── */
    defineField({
      name: 'mailchimpApiKey',
      title: 'Mailchimp API key',
      description: 'From Mailchimp → Account → Extras → API keys. Looks like 0123abcd…-us21 (the -usNN part matters).',
      type: 'string',
      group: 'newsletter',
      components: { input: EncryptedSecretField },
      hidden: ({ parent }) => parent?.newsletterProvider !== 'mailchimp',
    }),
    defineField({
      name: 'klaviyoApiKey',
      title: 'Klaviyo private API key',
      description: 'From Klaviyo → Settings → API keys → Create Private API Key (needs List access). Starts with pk_.',
      type: 'string',
      group: 'newsletter',
      components: { input: EncryptedSecretField },
      hidden: ({ parent }) => parent?.newsletterProvider !== 'klaviyo',
    }),
    defineField({
      name: 'marketoBaseUrl',
      title: 'Marketo REST endpoint',
      description: 'Your Marketo REST base URL, e.g. https://123-ABC-456.mktorest.com (Marketo → Admin → Web Services → REST API, without the /rest suffix).',
      type: 'url',
      group: 'newsletter',
      hidden: ({ parent }) => parent?.newsletterProvider !== 'marketo',
    }),
    defineField({
      name: 'marketoClientId',
      title: 'Marketo Client ID',
      description: 'From the LaunchPoint custom service (Marketo → Admin → LaunchPoint → your service → View Details).',
      type: 'string',
      group: 'newsletter',
      components: { input: EncryptedSecretField },
      hidden: ({ parent }) => parent?.newsletterProvider !== 'marketo',
    }),
    defineField({
      name: 'marketoClientSecret',
      title: 'Marketo Client Secret',
      description: 'The Client Secret from the same LaunchPoint custom service.',
      type: 'string',
      group: 'newsletter',
      components: { input: EncryptedSecretField },
      hidden: ({ parent }) => parent?.newsletterProvider !== 'marketo',
    }),
    defineField({
      name: 'newsletterWebhookUrl',
      title: 'Webhook URL',
      description: 'The catch-hook URL from Zapier / Make (or any endpoint). Each signup is POSTed as JSON { email, source, at }.',
      type: 'string',
      group: 'newsletter',
      components: { input: EncryptedSecretField },
      hidden: ({ parent }) => parent?.newsletterProvider !== 'webhook',
    }),
    defineField({
      name: 'newsletterListId',
      title: 'Audience / list ID',
      description: 'Mailchimp: the Audience ID. Klaviyo: the List ID. Marketo: the static list ID (optional). Webhook: not needed.',
      type: 'string',
      group: 'newsletter',
      hidden: ({ parent }) => parent?.newsletterProvider === 'webhook',
    }),
    defineField({
      name: 'newsletterHeadline',
      title: 'Footer signup headline',
      type: 'string',
      group: 'newsletter',
      initialValue: 'Sharp offers, no spam.',
    }),
    defineField({
      name: 'newsletterText',
      title: 'Footer signup text',
      type: 'text',
      rows: 2,
      group: 'newsletter',
      initialValue: 'The monthly lineup and the sharpest prices, straight to your inbox.',
    }),
    defineField({
      name: 'newsletterButtonLabel',
      title: 'Signup button label',
      type: 'string',
      group: 'newsletter',
      initialValue: 'Sign up',
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
    defineField({
      name: 'chatEnabled',
      title: 'Show "Talk to a specialist" chat',
      description:
        'OFF hides the chat button on the whole site (the floating blue pill). Independent of the AI toggle below.',
      type: 'boolean',
      initialValue: true,
      group: 'integrations',
    }),
    defineField({
      name: 'aiChatEnabled',
      title: 'AI specialist chat',
      description:
        'ON: the chat answers free-form questions with AI (grounded in the site facts; requires the AI key in the hosting environment). OFF: the built-in scripted answers only. The scripted product/store/guarantee answers and the human handoff always remain.',
      type: 'boolean',
      initialValue: false,
      group: 'integrations',
    }),
    defineField({
      name: 'pimFeedUrl',
      title: 'PIM: product feed URL',
      description:
        'Base URL of the product API this market reads from (Carl Ras product API for DK). URL only; API keys and secrets NEVER go in the CMS, they live in the hosting environment.',
      type: 'url',
      group: 'integrations',
    }),
    defineField({
      name: 'damBaseUrl',
      title: 'DAM: image base URL',
      description:
        'Base URL of the image bank (Digizuite for DK). Used by the image pipeline once the DAM integration is live. URL only, no credentials.',
      type: 'url',
      group: 'integrations',
    }),

    /* ── Microcopy: every small user-facing text on the site ── */
    defineField({ name: 'footerAbout', title: 'Footer: about paragraph', type: 'text', rows: 3, group: 'copy',
      description: 'The paragraph under the logo in the footer. Partner names (Meesenburg, Foussier, Lecot) become links automatically.' }),
    defineField({ name: 'chatFabLabel', title: 'Chat: floating button label', type: 'string', group: 'copy' }),
    defineField({ name: 'chatPanelHeadline', title: 'Chat: panel headline', type: 'string', group: 'copy' }),
    defineField({ name: 'chatPanelText', title: 'Chat: panel text', type: 'text', rows: 2, group: 'copy' }),
    defineField({ name: 'chatGreeting', title: 'Chat: greeting message', type: 'text', rows: 2, group: 'copy' }),
    defineField({ name: 'chatFallback', title: 'Chat: fallback answer', type: 'text', rows: 2, group: 'copy',
      description: 'Shown when neither the built-in answers nor the AI can help. Should offer the human handoff ("type yes").' }),
    defineField({ name: 'proClubHeadline', title: 'Pro Club: headline', type: 'string', group: 'copy' }),
    defineField({ name: 'proClubText', title: 'Pro Club: text', type: 'text', rows: 2, group: 'copy',
      description: 'The signup box on product pages. Submissions go to the Newsletter platform.' }),
    defineField({ name: 'newsHeadline', title: 'News: index headline', type: 'string', group: 'copy' }),
    defineField({ name: 'newsIntro', title: 'News: intro line', type: 'text', rows: 2, group: 'copy' }),
    defineField({ name: 'newsEmpty', title: 'News: empty-state text', type: 'string', group: 'copy' }),
    defineField({ name: 'newsletterSuccess', title: 'Newsletter: success message', type: 'string', group: 'copy' }),
    defineField({ name: 'produkterHeadline', title: 'Products page: headline', type: 'string', group: 'copy', description: '*word* = blue accent.' }),
    defineField({ name: 'produkterIntro', title: 'Products page: intro', type: 'text', rows: 2, group: 'copy' }),
    defineField({ name: 'butikkerHeadlineStores', title: 'Stores page: headline (stores tab)', type: 'string', group: 'copy' }),
    defineField({ name: 'butikkerHeadlineSpecialists', title: 'Stores page: headline (specialists tab)', type: 'string', group: 'copy' }),
    defineField({ name: 'serviceHeadline', title: 'Service page: headline', type: 'string', group: 'copy', description: '*word* = blue accent.' }),
    defineField({ name: 'serviceIntro', title: 'Service page: intro', type: 'text', rows: 2, group: 'copy' }),
    defineField({ name: 'fagHeadline', title: 'Trades page: headline', type: 'string', group: 'copy', description: '*word* = blue accent.' }),
    defineField({ name: 'fagIntro', title: 'Trades page: intro', type: 'text', rows: 3, group: 'copy' }),
    defineField({ name: 'notFoundHeadline', title: '404 page: headline', type: 'string', group: 'copy' }),
    defineField({ name: 'notFoundText', title: '404 page: text', type: 'string', group: 'copy' }),
  ],
  preview: { prepare: () => ({ title: 'Site settings' }) },
});
