import { defineField, defineType } from 'sanity';
import QrImageField from '../QrImageField';

/** Managed QR short links. Every FUTURE print run points its QR code at
 *  stroxx.eu/qr/<code>; each scan is counted (Dashboard tab) and forwarded
 *  to whatever target the editor sets, so a campaign can be repointed
 *  without ever reprinting packaging.
 *
 *  Old packaging QR codes that point at /pages/... keep working through the
 *  legacy redirects; they do not need a document here. */

export const qrCode = defineType({
  name: 'qrCode',
  title: 'QR code',
  type: 'document',
  description: 'A short link for print: stroxx.eu/qr/<code>. Scans are counted in the Dashboard.',
  fields: [
    defineField({
      name: 'code',
      title: 'Code',
      type: 'slug',
      description:
        'The short code in the printed URL, e.g. "st2" gives stroxx.eu/qr/st2. Short, lowercase, no spaces. NEVER change a code that is already in print; change its target instead.',
      validation: (r) =>
        r.required().custom((v) => {
          const c = (v as { current?: string } | undefined)?.current;
          return c && /^[a-z0-9-]{2,40}$/.test(c) ? true : 'Lowercase letters, digits and hyphens only (2-40 chars)';
        }),
    }),
    defineField({
      name: 'label',
      title: 'Label',
      type: 'string',
      description: 'For humans and the Dashboard, e.g. "ST-2 packaging 2026".',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'target',
      title: 'Target (path or full URL)',
      type: 'string',
      description: 'Where a scan lands: a path like /support/smart-locks-st2 or a full https:// URL. Change it any time; printed codes follow along.',
      validation: (r) =>
        r.required().custom((v) =>
          typeof v === 'string' && (/^\/[^\s]*$/.test(v) || /^https:\/\/[^\s]+$/.test(v))
            ? true
            : 'Must start with / or https://'
        ),
    }),
    defineField({
      name: 'active',
      title: 'Active',
      type: 'boolean',
      initialValue: true,
      description: 'Off = scans land on the homepage instead of the target (use for retired campaigns).',
    }),
    defineField({
      name: 'qrPreview',
      title: 'Printable QR code',
      type: 'string',
      readOnly: true,
      description: 'Download the SVG (best for print) or PNG and place it on the packaging artwork.',
      components: { input: QrImageField },
    }),
  ],
  preview: {
    select: { code: 'code.current', label: 'label', target: 'target' },
    prepare: ({ code, label, target }) => ({ title: `/qr/${code || '…'} · ${label || ''}`, subtitle: `→ ${target || ''}` }),
  },
});
