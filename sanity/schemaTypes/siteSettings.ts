import { defineArrayMember, defineField, defineType } from 'sanity';

const linkArray = (name: string, title: string, description: string) =>
  defineField({
    name,
    title,
    description,
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
 *  without a deploy lives here (production plan section 8). */
export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site settings',
  type: 'document',
  fields: [
    defineField({ name: 'retailerName', title: 'Retail partner', type: 'string', initialValue: 'Carl Ras' }),
    defineField({
      name: 'supportPhone',
      title: 'Customer service phone',
      description: 'Shown in the footer, nav, chat and guarantee modal.',
      type: 'string',
    }),
    defineField({
      name: 'supportHours',
      title: 'Customer service hours',
      description: 'Press Enter for a new line, e.g. Mon-Thu on one line, Friday on the next.',
      type: 'text',
      rows: 2,
    }),
    defineField({
      name: 'legalLine',
      title: 'Legal line (footer)',
      description: 'Legal entity line for the footer, e.g. company name + CVR.',
      type: 'string',
    }),
    defineField({
      name: 'gtmId',
      title: 'Google Tag Manager container ID',
      description: 'Format GTM-XXXXXXX. Loads GTM on every page; leave empty to disable. Manage tags, pixels and analytics inside GTM, no deploy needed.',
      type: 'string',
      validation: (r) =>
        r.custom((v) => (!v || /^GTM-[A-Z0-9]+$/i.test(v) ? true : 'Must look like GTM-XXXXXXX')),
    }),
    defineField({
      name: 'pimFeedUrl',
      title: 'PIM: product feed URL',
      description:
        'Base URL of the product API this market reads from (Carl Ras product API for DK). URL only; API keys and secrets NEVER go in the CMS, they live in the hosting environment.',
      type: 'url',
    }),
    defineField({
      name: 'seoTitle',
      title: 'SEO: site title',
      description: 'The default browser-tab/Google title. Subpages append their own name to it.',
      type: 'string',
    }),
    defineField({
      name: 'seoDescription',
      title: 'SEO: site description',
      description: 'The default description Google and social shares show when a page has no specific one. Aim for 150 to 160 characters.',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'ogImage',
      title: 'SEO: social share image path',
      description: 'Image shown when links are shared (Open Graph). Path under /public, ideally 1200x630, e.g. /brand/og.jpg.',
      type: 'string',
    }),
    defineField({
      name: 'llmsTxt',
      title: 'AEO: llms.txt content',
      description:
        'Served at /llms.txt: the brand summary AI answer engines (ChatGPT, Perplexity, Google AI) read. Plain markdown text. Leave empty to use the built-in version.',
      type: 'text',
      rows: 18,
    }),
    linkArray(
      'navLinks',
      'Menu: top navigation links',
      'The links in the top navigation, in order. The first four show on desktop; all show in the mobile menu. Leave empty for the built-in menu.'
    ),
    linkArray(
      'footerPageLinks',
      'Footer: "Pages" column links',
      'Leave empty for the built-in list.'
    ),
    linkArray(
      'footerBuyLinks',
      'Footer: "Buy" column links',
      'Leave empty for the built-in list.'
    ),
    defineField({
      name: 'damBaseUrl',
      title: 'DAM: image base URL',
      description:
        'Base URL of the image bank (Digizuite for DK). Used by the image pipeline once the DAM integration is live. URL only, no credentials.',
      type: 'url',
    }),
  ],
  preview: { prepare: () => ({ title: 'Site settings' }) },
});
