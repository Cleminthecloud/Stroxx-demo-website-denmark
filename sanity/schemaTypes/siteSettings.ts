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
  ],
  preview: { prepare: () => ({ title: 'Site settings' }) },
});
