import { defineArrayMember, defineField, defineType } from 'sanity';
import NewsletterStatusField from '../NewsletterStatusField';
import EncryptedSecretField from '../EncryptedSecretField';

const LANGS = [
  { title: 'Danish', value: 'da' },
  { title: 'German', value: 'de' },
  { title: 'Dutch', value: 'nl' },
  { title: 'French', value: 'fr' },
  { title: 'English', value: 'en' },
  { title: 'Spanish', value: 'es' },
];

/** A market is a country the STROXX brand site serves: its dealer, its "Buy at"
 *  CTA, its language(s) and its URL code. The international English version is a
 *  market too, flagged as the reference/fallback and served at the root.
 *
 *  Structural, per-market facts live here (language-independent). Translatable
 *  copy lives in the localised content documents; a market with two languages
 *  (Belgium: nl + fr) shares one market document. See
 *  docs/STROXX-market-localisation-plan.md. */
export const market = defineType({
  name: 'market',
  title: 'Market',
  type: 'document',
  fieldsets: [
    { name: 'identity', title: 'Market identity + routing', options: { collapsible: true, collapsed: false } },
    {
      name: 'dealer',
      title: 'Dealer (Where to buy)',
      description:
        'The buy contract: every Buy button in this market points at THIS dealer. Empty dealer fields on the international market are correct, its buttons open the dealer chooser instead. Never point one market at another market\'s shop.',
      options: { collapsible: true, collapsed: false },
    },
    { name: 'footer', title: 'Footer contact + legal', options: { collapsible: true, collapsed: false } },
    {
      name: 'tracking',
      title: 'Tracking + consent',
      description:
        'This market\'s Google Tag Manager container and Cookiebot consent banner. Per MARKET, not per language: Belgium\'s Dutch and French pages share this one market document, so its IDs are entered once here. On the international (reference) market these are normally EMPTY: no tracking on the reference site unless deliberately set. Moved here from Site settings 2026-07-11.',
      options: { collapsible: true, collapsed: true },
    },
    {
      name: 'newsletter',
      title: 'Newsletter (provider + keys)',
      description:
        'Which email platform this market\'s signups go to, and its keys. Per MARKET, not per language: Belgium\'s two language versions share this one setup. The signup form\'s WORDS (headline, button, consent line, popup rules) stay on each language\'s Site settings document. On the international (reference) market this is normally EMPTY unless the international site deliberately collects signups. Moved here from Site settings 2026-07-11.',
      options: { collapsible: true, collapsed: true },
    },
  ],
  fields: [
    defineField({ name: 'name', title: 'Market name', type: 'string', fieldset: 'identity', description: 'e.g. Denmark, Germany, International (English).', validation: (r) => r.required() }),
    defineField({
      name: 'code',
      title: 'URL code',
      type: 'slug',
      fieldset: 'identity',
      description: 'The path segment, e.g. "dk" gives /dk. The reference market is served at the root.',
      options: { source: 'name' },
      validation: (r) =>
        r.required().custom((v) => {
          const c = (v as { current?: string } | undefined)?.current;
          return c && /^[a-z]{2,5}$/.test(c) ? true : 'Two to five lowercase letters (e.g. dk, de, fr, be, int)';
        }),
    }),
    defineField({
      name: 'languages',
      title: 'Languages',
      type: 'array',
      fieldset: 'identity',
      description: 'Which languages this market publishes in (Belgium has two: nl + fr). Informational: routing is code-owned in lib/i18n.ts.',
      of: [defineArrayMember({ type: 'string' })],
      options: { list: LANGS },
      validation: (r) => r.required().min(1),
    }),
    defineField({ name: 'defaultLanguage', title: 'Default language', type: 'string', fieldset: 'identity', description: 'The language shown first for this market. Informational: routing and language resolution are code-owned in lib/i18n.ts.', options: { list: LANGS } }),
    defineField({ name: 'isReference', title: 'Reference / international (served at root)', type: 'boolean', fieldset: 'identity', initialValue: false, description: 'The English international version: the fallback and hreflang x-default. Exactly one market has this on.' }),
    defineField({ name: 'active', title: 'Live', type: 'boolean', fieldset: 'identity', initialValue: false, description: 'Informational for now: which markets count as launched. Site visibility is code-owned (lib/i18n.ts) and the dealer chooser deliberately lists every dealer; gating by this flag is a market-launch build item.' }),
    defineField({ name: 'dealerName', title: 'Dealer / distributor', type: 'string', fieldset: 'dealer', description: 'e.g. Carl Ras, Meesenburg, Foussier, Lecot. Deliberately EMPTY on the international (reference) market: it has no single dealer, so its Buy buttons open the dealer chooser instead.' }),
    defineField({ name: 'dealerCtaUrl', title: 'Buy-at CTA link', type: 'url', fieldset: 'dealer', description: 'Where the "Buy at <dealer>" button points for this market. If empty, Buy buttons fall back to the dealer chooser, never another market’s shop. Empty is correct on the international market.' }),
    defineField({ name: 'supportPhone', title: 'Customer service phone', type: 'string', fieldset: 'footer' }),
    defineField({ name: 'supportHours', title: 'Customer service hours', type: 'string', fieldset: 'footer' }),
    defineField({ name: 'legalLine', title: 'Footer legal line (local HQ)', type: 'string', fieldset: 'footer', description: 'The dealer / HQ address shown at the bottom of the footer for this market, e.g. "© Meesenburg GmbH & Co. KG | Westerallee 162 | 24941 Flensburg". The international (reference) version shows a neutral STROXX line.' }),
    defineField({
      name: 'legalLinks',
      title: 'Legal links',
      type: 'array',
      fieldset: 'footer',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'legalLink',
          fields: [
            defineField({ name: 'label', title: 'Label', type: 'string' }),
            defineField({ name: 'href', title: 'Link', type: 'string' }),
          ],
          preview: { select: { title: 'label', subtitle: 'href' } },
        }),
      ],
    }),
    /* ── Tracking + consent: per-market operations, read by app/layout.tsx for
       whichever market the visitor is on. Cookiebot gates GTM (consent first). ── */
    defineField({
      name: 'gtmId',
      title: 'Google Tag Manager container ID',
      description:
        'Format GTM-XXXXXXX. Loads GTM on every page of THIS market (used by the site layout); leave empty to disable. Manage tags, pixels, analytics AND third-party chat widgets inside GTM, no deploy needed. One market, one container: Belgium\'s two languages share this ID. Normally empty on the international (reference) market.',
      type: 'string',
      fieldset: 'tracking',
      validation: (r) =>
        r.custom((v) => (!v || /^GTM-[A-Z0-9]+$/i.test(v) ? true : 'Must look like GTM-XXXXXXX')),
    }),
    defineField({
      name: 'cookiebotId',
      title: 'Cookiebot consent banner ID (CBID)',
      description:
        'From manage.cookiebot.com, this market\'s domain group ID (a UUID like 12345678-1234-1234-1234-123456789012). Shows the cookie consent banner on every page of THIS market and auto-blocks tracking until consent; consent gates GTM. Required before real traffic in the EU. One market, one CBID: Belgium\'s two languages share it. Normally empty on the international (reference) market. Leave empty to disable.',
      type: 'string',
      fieldset: 'tracking',
      validation: (r) =>
        r.custom((v) =>
          !v || /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v)
            ? true
            : 'Must be a Cookiebot CBID (UUID format)'
        ),
    }),

    /* ── Newsletter operations: provider choice, keys and list ID for THIS
       market's signups (read by /api/newsletter). The form's copy stays on the
       per-language Site settings documents. ── */
    defineField({
      name: 'newsletterStatus',
      title: 'Connection status',
      type: 'string',
      readOnly: true,
      fieldset: 'newsletter',
      components: { input: NewsletterStatusField },
      description: 'Checked for this market as you open this box. Nothing to fill in here.',
    }),
    defineField({
      name: 'newsletterEnabled',
      title: 'Newsletter signup on the site',
      description:
        'Shows the signup form on THIS market\'s pages (footer band, popup, landing-page signup blocks; Belgium: both languages). Configure the provider below before switching on. Normally off on the international (reference) market.',
      type: 'boolean',
      initialValue: false,
      fieldset: 'newsletter',
    }),
    defineField({
      name: 'newsletterProvider',
      title: 'Email platform',
      description:
        'Where THIS market\'s signups are sent. Pick your platform, then enter its keys in the fields that appear below. Keys are encrypted in your browser before saving, so it is safe to enter them here.',
      type: 'string',
      fieldset: 'newsletter',
      options: {
        list: [
          { title: 'Brevo (EU-hosted, recommended)', value: 'brevo' },
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
      name: 'brevoApiKey',
      title: 'Brevo API key',
      description:
        'This market\'s key, used by the signup API. From Brevo, then SMTP & API, then API keys. Starts with xkeysib-. Subscriber data stays in the EU on every Brevo plan, which is why it is the recommended platform for STROXX.',
      type: 'string',
      fieldset: 'newsletter',
      components: { input: EncryptedSecretField },
      hidden: ({ parent }) => parent?.newsletterProvider !== 'brevo',
    }),
    defineField({
      name: 'brevoDoubleOptInTemplateId',
      title: 'Brevo double opt-in template ID',
      description:
        'The numeric ID of the Brevo template that sends the confirmation email. With this filled in, Brevo runs proper double opt-in: the person is not added to the list until they click the link. Leave it empty ONLY if this market has a legal reason not to confirm, which in Denmark and Germany it does not. Brevo requires a confirmation landing page alongside it, so fill in the next field too.',
      type: 'number',
      fieldset: 'newsletter',
      hidden: ({ parent }) => parent?.newsletterProvider !== 'brevo',
      validation: (r) =>
        r.custom((value, ctx) => {
          const p = ctx.parent as { newsletterProvider?: string; brevoRedirectUrl?: string } | undefined;
          if (p?.newsletterProvider !== 'brevo') return true;
          if (value && !p?.brevoRedirectUrl) return 'Brevo needs a confirmation landing page with the template. Without it, double opt-in is skipped and signups go straight onto the list.';
          return true;
        }),
    }),
    defineField({
      name: 'brevoRedirectUrl',
      title: 'Brevo confirmation landing page',
      description:
        'Where the person lands after clicking the confirmation link, e.g. https://stroxx.eu/dk/newsletter-confirmed. Only used with double opt-in.',
      type: 'url',
      fieldset: 'newsletter',
      hidden: ({ parent }) => parent?.newsletterProvider !== 'brevo',
    }),
    defineField({
      name: 'mailchimpApiKey',
      title: 'Mailchimp API key',
      description: 'This market\'s key, used by the signup API. From Mailchimp → Account → Extras → API keys. Looks like 0123abcd…-us21 (the -usNN part matters).',
      type: 'string',
      fieldset: 'newsletter',
      components: { input: EncryptedSecretField },
      hidden: ({ parent }) => parent?.newsletterProvider !== 'mailchimp',
    }),
    defineField({
      name: 'klaviyoApiKey',
      title: 'Klaviyo private API key',
      description: 'This market\'s key, used by the signup API. From Klaviyo → Settings → API keys → Create Private API Key (needs List access). Starts with pk_.',
      type: 'string',
      fieldset: 'newsletter',
      components: { input: EncryptedSecretField },
      hidden: ({ parent }) => parent?.newsletterProvider !== 'klaviyo',
    }),
    defineField({
      name: 'marketoBaseUrl',
      title: 'Marketo REST endpoint',
      description: 'This market\'s Marketo REST base URL, e.g. https://123-ABC-456.mktorest.com (Marketo → Admin → Web Services → REST API, without the /rest suffix).',
      type: 'url',
      fieldset: 'newsletter',
      hidden: ({ parent }) => parent?.newsletterProvider !== 'marketo',
    }),
    defineField({
      name: 'marketoClientId',
      title: 'Marketo Client ID',
      description: 'From the LaunchPoint custom service (Marketo → Admin → LaunchPoint → your service → View Details). Used by the signup API for this market.',
      type: 'string',
      fieldset: 'newsletter',
      components: { input: EncryptedSecretField },
      hidden: ({ parent }) => parent?.newsletterProvider !== 'marketo',
    }),
    defineField({
      name: 'marketoClientSecret',
      title: 'Marketo Client Secret',
      description: 'The Client Secret from the same LaunchPoint custom service. Used by the signup API for this market.',
      type: 'string',
      fieldset: 'newsletter',
      components: { input: EncryptedSecretField },
      hidden: ({ parent }) => parent?.newsletterProvider !== 'marketo',
    }),
    defineField({
      name: 'newsletterWebhookUrl',
      title: 'Webhook URL',
      description: 'The catch-hook URL from Zapier / Make (or any endpoint) that receives THIS market\'s signups. Each signup is POSTed as JSON { email, source, at }.',
      type: 'string',
      fieldset: 'newsletter',
      components: { input: EncryptedSecretField },
      hidden: ({ parent }) => parent?.newsletterProvider !== 'webhook',
    }),
    defineField({
      name: 'newsletterListId',
      title: 'Audience / list ID',
      description: 'The list THIS market\'s signups land in. Brevo: the numeric list ID. Mailchimp: the Audience ID. Klaviyo: the List ID. Marketo: the static list ID (optional). Webhook: not needed.',
      type: 'string',
      fieldset: 'newsletter',
      hidden: ({ parent }) => parent?.newsletterProvider === 'webhook',
    }),

    defineField({ name: 'order', title: 'Sort order', type: 'number', fieldset: 'identity', initialValue: 0, description: 'Order in the market/language switcher.' }),
  ],
  preview: {
    select: { name: 'name', code: 'code.current', langs: 'languages', ref: 'isReference', active: 'active' },
    prepare: ({ name, code, langs, ref, active }) => ({
      title: `${name || 'Market'}${ref ? ' · reference' : ''}`,
      subtitle: `/${code || '…'} · ${(Array.isArray(langs) ? langs.join(', ') : '') || 'no languages'}${active ? '' : ' · not live'}`,
    }),
  },
});
