import { defineField, defineType } from 'sanity';

/** Editor-managed URL redirects, applied by middleware without a deploy.
 *  The classic use: a campaign page gets renamed and the old QR code /
 *  printed URL / newsletter link must keep working. */

export const redirect = defineType({
  name: 'redirect',
  title: 'Redirect',
  type: 'document',
  description: 'Send an old URL to a new one. Takes effect within a minute, no deploy needed.',
  fields: [
    defineField({
      name: 'from',
      title: 'From path',
      type: 'string',
      description: 'The old path on this site, starting with /, e.g. /kampagne/sommer',
      validation: (r) =>
        r.required().custom((v) =>
          typeof v === 'string' && /^\/[^\s?#]*$/.test(v)
            ? true
            : 'Must be a path starting with /, no spaces or ?/#'
        ),
    }),
    defineField({
      name: 'to',
      title: 'To (path or full URL)',
      type: 'string',
      description: 'Where visitors should land: a path like /kampagne/efteraar or a full https:// URL.',
      validation: (r) =>
        r.required().custom((v) =>
          typeof v === 'string' && (/^\/(?![/\\])[^\s]*$/.test(v) || /^https:\/\/[^\s]+$/.test(v))
            ? true
            : 'Must be a path with a single leading / (not // or /\\) or a full https:// URL'
        ),
    }),
    defineField({
      name: 'permanent',
      title: 'Permanent (301)',
      type: 'boolean',
      initialValue: true,
      description: 'On = permanent (search engines transfer the ranking). Off = temporary (302), for short campaigns.',
    }),
  ],
  preview: { select: { title: 'from', subtitle: 'to' } },
});
