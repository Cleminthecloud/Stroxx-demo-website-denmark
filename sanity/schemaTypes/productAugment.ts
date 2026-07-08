import { defineField, defineType } from 'sanity';
import SkuInput from '../SkuInput';

/** Marketing layer ON TOP of the product feed, keyed by SKU. The PIM stays
 *  the source of truth for name/specs (production plan section 3); this
 *  document only augments editorial marketing: copy overrides, featured flags.
 *  NO PRICES — the brand site never shows or uses prices; pricing is the
 *  dealer's job. Joined at render by lib/cms.ts once the PIM pipeline lands. */
export const productAugment = defineType({
  name: 'productAugment',
  title: 'Product augment (marketing layer)',
  type: 'document',
  fields: [
    defineField({ name: 'language', type: 'string', readOnly: true, hidden: true }),
    defineField({
      name: 'sku',
      title: 'Product',
      description: 'The product this augment applies to. Search by name or item number.',
      type: 'string',
      components: { input: SkuInput },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'marketingCopy',
      title: 'Marketing copy override',
      description: 'Replaces the feed description on the product page when set.',
      type: 'text',
      rows: 4,
    }),
    defineField({ name: 'featured', title: 'Featured product', type: 'boolean', initialValue: false }),
  ],
  preview: { select: { title: 'sku', subtitle: 'marketingCopy' } },
});
