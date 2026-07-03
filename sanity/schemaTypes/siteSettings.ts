import { defineArrayMember, defineField, defineType } from 'sanity';

const linkArray = (name: string, title: string, description: string, group: string) =>
  defineField({
    name,
    title,
    description,
    group,
    type: 'array',
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
    { name: 'integrations', title: 'Integrations (PIM/DAM/AI)' },
  ],
  fields: [
    defineField({ name: 'retailerName', title: 'Retail partner', type: 'string', initialValue: 'Carl Ras', group: 'contact' }),
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
  ],
  preview: { prepare: () => ({ title: 'Site settings' }) },
});
