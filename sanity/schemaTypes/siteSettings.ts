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
  ],
  preview: { prepare: () => ({ title: 'Site settings' }) },
});
