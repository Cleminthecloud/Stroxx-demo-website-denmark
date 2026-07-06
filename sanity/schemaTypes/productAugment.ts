import { defineField, defineType } from 'sanity';

/** Marketing layer ON TOP of the product feed, keyed by SKU. The PIM stays
 *  the source of truth for name/price/specs (production plan section 3); this
 *  document only augments: compare prices, copy overrides, featured flags.
 *  Joined at render by lib/cms.ts once the PIM pipeline lands. */
export const productAugment = defineType({
  name: 'productAugment',
  title: 'Product augment (marketing layer)',
  type: 'document',
  fields: [
    defineField({
      name: 'sku',
      title: 'Product SKU',
      description: 'Item number (SKU) this augment applies to.',
      type: 'string',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'marketingCopy',
      title: 'Marketing copy override',
      description: 'Replaces the feed description on the product page when set.',
      type: 'text',
      rows: 4,
    }),
    defineField({
      name: 'compareRefPrice',
      title: 'Comparison reference price (DKK)',
      description: 'A-brand reference for the price-comparison block. Legal sign-off required per market before use.',
      type: 'number',
    }),
    defineField({ name: 'compareLabel', title: 'Comparison label', type: 'string' }),
    defineField({ name: 'featured', title: 'Featured product', type: 'boolean', initialValue: false }),
  ],
  preview: { select: { title: 'sku', subtitle: 'marketingCopy' } },
});
