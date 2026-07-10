import { defineField, defineType } from 'sanity';

/** One document per physical store. Feeds the /butikker finder and the
 *  "nearest store" logic in the specialist FAB. Mirrors the Store type in
 *  lib/stores.ts; the old Webflow snapshot remains the fallback if the CMS is
 *  empty. GDPR: manager photo + direct phone need the consent flag ON. */
export const store = defineType({
  name: 'store',
  title: 'Store',
  type: 'document',
  fields: [
    defineField({ name: 'name', title: 'Name', type: 'string', validation: (r) => r.required() }),
    defineField({
      name: 'brand',
      title: 'Brand',
      type: 'string',
      options: { list: ['Carl Ras', '3Aktive'], layout: 'radio' },
      initialValue: 'Carl Ras',
    }),
    defineField({
      name: 'country',
      title: 'Country',
      type: 'string',
      options: {
        list: [
          { title: 'Denmark', value: 'dk' },
          { title: 'Germany', value: 'de' },
          { title: 'France', value: 'fr' },
          { title: 'Belgium', value: 'be' },
        ],
        layout: 'radio',
      },
      initialValue: 'dk',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'region',
      title: 'Region / area',
      description: 'Free text, e.g. a region or state (Sjælland, Bayern, …). Used for the filter chips on a single-country site.',
      type: 'string',
    }),
    defineField({ name: 'address', title: 'Street address', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'zipCity', title: 'Zip + city', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'lat', title: 'Latitude', type: 'number', validation: (r) => r.required().min(34).max(72) }),
    defineField({ name: 'lng', title: 'Longitude', type: 'number', validation: (r) => r.required().min(-11).max(32) }),
    defineField({ name: 'mapsUrl', title: 'Google Maps link', type: 'url' }),
    defineField({ name: 'managerName', title: 'Manager name', type: 'string' }),
    defineField({ name: 'managerEmail', title: 'Manager email', type: 'string' }),
    defineField({ name: 'managerPhone', title: 'Manager direct phone', type: 'string' }),
    defineField({
      name: 'managerPhotoUpload',
      title: 'Manager photo (upload or pick from media library)',
      type: 'image',
      options: { hotspot: true },
      description: 'Preferred. Overrides the URL below when set.',
    }),
    defineField({ name: 'managerPhoto', title: 'Manager photo URL (fallback)', type: 'url' }),
    defineField({
      name: 'managerConsent',
      title: 'Manager consent given (photo + direct phone on the web)',
      description: 'Required before publishing personal details. Production blocks publish without it.',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'specialist',
      title: 'STROXX Specialist (optional)',
      description: 'A dedicated STROXX contact person for this store, shown on the store card. Leave blank if the store has none. Photo + phone need consent ON.',
      type: 'object',
      fields: [
        defineField({ name: 'name', title: 'Name', type: 'string' }),
        defineField({ name: 'role', title: 'Role / title', type: 'string', description: 'e.g. "STROXX Specialist", "Værktøjsspecialist".' }),
        defineField({ name: 'photoUpload', title: 'Photo (upload or pick from media)', type: 'image', options: { hotspot: true } }),
        defineField({ name: 'photo', title: 'Photo URL (fallback)', type: 'url' }),
        defineField({ name: 'email', title: 'Email', type: 'string' }),
        defineField({ name: 'phone', title: 'Direct phone', type: 'string' }),
        defineField({ name: 'consent', title: 'Consent given (photo + phone on the web)', type: 'boolean', initialValue: false }),
      ],
      options: { collapsible: true, collapsed: true },
    }),
    defineField({
      name: 'openMonThu',
      title: 'Mon-Thu opening',
      description: 'Decimal clock: 6.3 = 06:30, 16 = 16:00.',
      type: 'number',
    }),
    defineField({ name: 'closeMonThu', title: 'Mon-Thu closing', type: 'number' }),
    defineField({ name: 'openFri', title: 'Friday opening', type: 'number' }),
    defineField({ name: 'closeFri', title: 'Friday closing', type: 'number' }),
    defineField({ name: 'weekendClosed', title: 'Closed on weekends', type: 'boolean', initialValue: true }),
    defineField({ name: 'festool', title: 'Festool shop-in-shop', type: 'boolean', initialValue: false }),
    defineField({ name: 'sikring', title: 'Sikring shop-in-shop', type: 'boolean', initialValue: false }),
    defineField({ name: 'aktive3', title: '3Aktive shop-in-shop', type: 'boolean', initialValue: false }),
    defineField({ name: 'active', title: 'Active (shown on the site)', type: 'boolean', initialValue: true }),
  ],
  preview: { select: { title: 'name', subtitle: 'zipCity' } },
});
