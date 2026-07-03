import { defineField, defineType } from 'sanity';

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
    defineField({ name: 'supportHours', title: 'Customer service hours', type: 'string' }),
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
      name: 'damBaseUrl',
      title: 'DAM: image base URL',
      description:
        'Base URL of the image bank (Digizuite for DK). Used by the image pipeline once the DAM integration is live. URL only, no credentials.',
      type: 'url',
    }),
  ],
  preview: { prepare: () => ({ title: 'Site settings' }) },
});
