import { defineField, defineType } from 'sanity';

/** One document per physical store. Feeds the /butikker finder and the
 *  "nearest store" logic in the specialist FAB. Mirrors the Store type in
 *  lib/stores.ts; the old Webflow snapshot remains the fallback if the CMS is
 *  empty. GDPR: manager photo + direct phone need the consent flag ON. */
export const store = defineType({
  name: 'store',
  title: 'Store',
  type: 'document',
  fieldsets: [
    { name: 'location', title: 'Location', options: { collapsible: true, collapsed: false } },
    { name: 'contact', title: 'Contact (store)', options: { collapsible: true, collapsed: false } },
    {
      name: 'manager',
      title: 'Store manager',
      description: 'The named contact on the store card. The consent switch at the bottom controls whether the photo and direct phone appear on the site.',
      options: { collapsible: true, collapsed: false },
    },
    { name: 'hours', title: 'Opening hours', options: { collapsible: true, collapsed: false } },
    { name: 'flags', title: 'Shop-in-shop + visibility', options: { collapsible: true, collapsed: false } },
  ],
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      fieldset: 'location',
      description: 'The store name as it reads on the store card, e.g. "Carl Ras Glostrup".',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'brand',
      title: 'Brand',
      type: 'string',
      fieldset: 'location',
      description: 'Which chain the store belongs to; controls the logo on the store card.',
      options: { list: ['Carl Ras', '3Aktive', 'Meesenburg', 'Foussier', 'Lecot'], layout: 'radio' },
      initialValue: 'Carl Ras',
    }),
    defineField({
      name: 'country',
      title: 'Country',
      type: 'string',
      fieldset: 'location',
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
      fieldset: 'location',
    }),
    defineField({ name: 'address', title: 'Street address', type: 'string', fieldset: 'location', validation: (r) => r.required() }),
    defineField({ name: 'zipCity', title: 'Zip + city', type: 'string', fieldset: 'location', validation: (r) => r.required() }),
    defineField({
      name: 'lat',
      title: 'Latitude',
      type: 'number',
      fieldset: 'location',
      description: 'Right-click the store in Google Maps and the coordinates appear at the top of the menu; the FIRST number is the latitude.',
      validation: (r) => r.required().min(34).max(72).error('Latitude in Europe is between 34 and 72; copy it from Google Maps (the first of the two numbers)'),
    }),
    defineField({
      name: 'lng',
      title: 'Longitude',
      type: 'number',
      fieldset: 'location',
      description: 'The SECOND number from the same Google Maps right-click menu.',
      validation: (r) => r.required().min(-11).max(32).error('Longitude in Europe is between -11 and 32; copy it from Google Maps (the second of the two numbers)'),
    }),
    defineField({
      name: 'mapsUrl',
      title: 'Google Maps link',
      type: 'url',
      fieldset: 'location',
      description: 'The Share link from Google Maps; the directions link on the store card uses it.',
    }),
    defineField({
      name: 'storePhone',
      title: 'Store phone (general)',
      type: 'string',
      fieldset: 'contact',
      description: 'The store\'s general line, shown when there is no named manager (typical for the dealer stores abroad).',
    }),
    defineField({ name: 'storeEmail', title: 'Store email (general)', type: 'string', fieldset: 'contact' }),
    defineField({ name: 'managerName', title: 'Manager name', type: 'string', fieldset: 'manager' }),
    defineField({ name: 'managerEmail', title: 'Manager email', type: 'string', fieldset: 'manager' }),
    defineField({ name: 'managerPhone', title: 'Manager direct phone', type: 'string', fieldset: 'manager' }),
    defineField({
      name: 'managerPhotoUpload',
      title: 'Manager photo (upload or pick from media library)',
      type: 'image',
      fieldset: 'manager',
      options: { hotspot: true },
      description: 'Preferred. Overrides the URL below when set.',
    }),
    defineField({ name: 'managerPhoto', title: 'Manager photo URL (fallback)', type: 'url', fieldset: 'manager' }),
    defineField({
      name: 'managerConsent',
      title: 'Manager consent given (photo + direct phone on the web)',
      description: 'Must be ON before the manager\'s photo and direct phone appear on the site; while it is off, the site quietly hides them.',
      type: 'boolean',
      fieldset: 'manager',
      initialValue: false,
      validation: (r) =>
        r
          .custom((consent, context) => {
            const doc = context.document as
              | { managerPhotoUpload?: unknown; managerPhoto?: string; managerPhone?: string }
              | undefined;
            const hasDetails = Boolean(doc?.managerPhotoUpload || doc?.managerPhoto || doc?.managerPhone);
            return !consent && hasDetails
              ? 'A photo or direct phone is filled in but consent is off, so the site will hide this person.'
              : true;
          })
          .warning(),
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
        defineField({
          name: 'consent',
          title: 'Consent given (photo + phone on the web)',
          type: 'boolean',
          initialValue: false,
          description: 'Must be ON before the photo and direct phone appear on the site; while it is off, the site quietly hides them.',
          validation: (r) =>
            r
              .custom((consent, context) => {
                const p = context.parent as { photoUpload?: unknown; photo?: string; phone?: string } | undefined;
                const hasDetails = Boolean(p?.photoUpload || p?.photo || p?.phone);
                return !consent && hasDetails
                  ? 'A photo or direct phone is filled in but consent is off, so the site will hide this person.'
                  : true;
              })
              .warning(),
        }),
      ],
      options: { collapsible: true, collapsed: true },
    }),
    defineField({
      name: 'openMonThu',
      title: 'Mon-Thu opening',
      description: 'Decimal clock: 6.3 = 06:30, 16 = 16:00.',
      type: 'number',
      fieldset: 'hours',
    }),
    defineField({ name: 'closeMonThu', title: 'Mon-Thu closing', type: 'number', fieldset: 'hours', description: 'Decimal clock: 6.3 = 06:30, 16 = 16:00.' }),
    defineField({ name: 'openFri', title: 'Friday opening', type: 'number', fieldset: 'hours', description: 'Decimal clock: 6.3 = 06:30, 16 = 16:00.' }),
    defineField({ name: 'closeFri', title: 'Friday closing', type: 'number', fieldset: 'hours', description: 'Decimal clock: 6.3 = 06:30, 16 = 16:00.' }),
    defineField({ name: 'weekendClosed', title: 'Closed on weekends', type: 'boolean', fieldset: 'hours', initialValue: true }),
    defineField({ name: 'festool', title: 'Festool shop-in-shop', type: 'boolean', fieldset: 'flags', initialValue: false }),
    defineField({ name: 'sikring', title: 'Sikring shop-in-shop', type: 'boolean', fieldset: 'flags', initialValue: false }),
    defineField({ name: 'aktive3', title: '3Aktive shop-in-shop', type: 'boolean', fieldset: 'flags', initialValue: false }),
    defineField({ name: 'active', title: 'Active (shown on the site)', type: 'boolean', fieldset: 'flags', initialValue: true }),
  ],
  preview: { select: { title: 'name', subtitle: 'zipCity' } },
});
