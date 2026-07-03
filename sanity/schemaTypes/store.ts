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
      name: 'region',
      title: 'Region',
      type: 'string',
      options: { list: ['Sjælland', 'Fyn', 'Jylland'], layout: 'radio' },
      validation: (r) => r.required(),
    }),
    defineField({ name: 'address', title: 'Street address', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'zipCity', title: 'Zip + city', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'lat', title: 'Latitude', type: 'number', validation: (r) => r.required().min(54).max(58) }),
    defineField({ name: 'lng', title: 'Longitude', type: 'number', validation: (r) => r.required().min(7).max(13) }),
    defineField({ name: 'mapsUrl', title: 'Google Maps link', type: 'url' }),
    defineField({ name: 'managerName', title: 'Manager name', type: 'string' }),
    defineField({ name: 'managerEmail', title: 'Manager email', type: 'string' }),
    defineField({ name: 'managerPhone', title: 'Manager direct phone', type: 'string' }),
    defineField({ name: 'managerPhoto', title: 'Manager photo URL', type: 'url' }),
    defineField({
      name: 'managerConsent',
      title: 'Manager consent given (photo + direct phone on the web)',
      description: 'Required before publishing personal details. Production blocks publish without it.',
      type: 'boolean',
      initialValue: false,
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
