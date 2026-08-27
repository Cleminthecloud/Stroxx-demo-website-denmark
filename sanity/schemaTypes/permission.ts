import { defineArrayMember, defineField, defineType } from 'sanity';

/** ONE permission record per person per market: the EU-level permission
 *  database that lives on stroxx.eu.
 *
 *  Why it exists at all, when an email platform already stores subscribers:
 *  the email platform stores a SUBSCRIBER, we need the PROOF. German case law
 *  puts the burden of proving consent on the sender, and no email platform
 *  exports the exact wording the person agreed to, frozen at the moment they
 *  agreed. So the wording, its version, the page it was shown on, the time and
 *  the IP live here, in a store we own, on our own domain. The email platform
 *  becomes a sending tool we can swap without losing the permission.
 *
 *  It is also the thing that makes segmentation ours rather than a vendor's:
 *  country, dealer/partner, language, signup surface and, only where the person
 *  has said yes to it, which product pages they looked at.
 *
 *  READ-ONLY IN THE STUDIO BY DESIGN. Records are written by /api/newsletter
 *  and /api/track, never by hand: a hand-edited consent record is not evidence
 *  of anything. Editors browse and filter; they do not type here.
 *
 *  Full design, retention and lawful-basis notes:
 *  docs/STROXX-permission-database.md */

export const permission = defineType({
  name: 'permission',
  title: 'Permission record',
  type: 'document',
  readOnly: true,
  fieldsets: [
    { name: 'who', title: 'Who and where', options: { collapsible: true, collapsed: false } },
    { name: 'consent', title: 'What they agreed to (the evidence)', options: { collapsible: true, collapsed: false } },
    { name: 'behaviour', title: 'Interest signals (only with behaviour consent)', options: { collapsible: true, collapsed: true } },
    { name: 'sync', title: 'Email platform sync', options: { collapsible: true, collapsed: true } },
  ],
  fields: [
    defineField({ name: 'email', title: 'Email', type: 'string', fieldset: 'who' }),
    defineField({
      name: 'emailHash',
      title: 'Email hash',
      type: 'string',
      fieldset: 'who',
      description: 'SHA-256 of the lowercased address. Used to match a record without moving the address around, e.g. in exports and logs.',
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      fieldset: 'who',
      description:
        'Pending means the confirmation email has gone out but the link has not been clicked. Only Confirmed records may be mailed.',
      options: {
        list: [
          { title: 'Pending confirmation', value: 'pending' },
          { title: 'Confirmed', value: 'confirmed' },
          { title: 'Unsubscribed', value: 'unsubscribed' },
          { title: 'Bounced or suppressed', value: 'suppressed' },
        ],
      },
    }),
    defineField({ name: 'market', title: 'Market code', type: 'string', fieldset: 'who', description: 'dk, de, fr, be, int. The market whose pages they signed up on.' }),
    defineField({ name: 'marketName', title: 'Market', type: 'string', fieldset: 'who' }),
    defineField({
      name: 'partner',
      title: 'Dealer / partner',
      type: 'string',
      fieldset: 'who',
      description: 'The dealer that owns this market, e.g. Carl Ras, Meesenburg, Foussier, Lecot. Derived from the market, so it is always consistent and never typed in.',
    }),
    defineField({ name: 'language', title: 'Language', type: 'string', fieldset: 'who', description: 'The language version of the page they signed up on.' }),
    defineField({
      name: 'trade',
      title: 'Trade',
      type: 'string',
      fieldset: 'who',
      description: 'Their trade, if a trade page or a form told us. Empty until asked for; the preference page is where this gets filled in.',
    }),

    /* ── the evidence ── */
    defineField({ name: 'newsletterConsent', title: 'Newsletter consent given', type: 'boolean', fieldset: 'consent' }),
    defineField({
      name: 'behaviourConsent',
      title: 'Behaviour consent given',
      type: 'boolean',
      fieldset: 'consent',
      description:
        'A separate, freely given yes to us linking what they view on the site to their address. Off means no interest signal is ever recorded against this record, whatever the cookie banner says.',
    }),
    defineField({
      name: 'consentVersion',
      title: 'Consent wording version',
      type: 'string',
      fieldset: 'consent',
      description: 'The version tag of the wording shown to them, e.g. 2026-08-v1. Changing the wording on the site means a new version, never a rewrite of old records.',
    }),
    defineField({
      name: 'consentText',
      title: 'Exact wording shown',
      type: 'text',
      rows: 3,
      fieldset: 'consent',
      description: 'Frozen at the moment of signup. This is the field that answers "prove what they agreed to" three years from now.',
    }),
    defineField({ name: 'consentAt', title: 'Agreed at', type: 'datetime', fieldset: 'consent' }),
    defineField({ name: 'confirmedAt', title: 'Confirmed at (double opt-in)', type: 'datetime', fieldset: 'consent' }),
    defineField({ name: 'unsubscribedAt', title: 'Unsubscribed at', type: 'datetime', fieldset: 'consent' }),
    defineField({
      name: 'sourcePath',
      title: 'Page they signed up on',
      type: 'string',
      fieldset: 'consent',
      description: 'The path, without query string.',
    }),
    defineField({
      name: 'sourceSurface',
      title: 'Where on the page',
      type: 'string',
      fieldset: 'consent',
      description: 'Footer band, popup, landing page block, Pro Club. Tells you which surface actually earns permissions.',
    }),
    defineField({
      name: 'campaign',
      title: 'Campaign',
      type: 'string',
      fieldset: 'consent',
      description: 'The utm_campaign value, if they arrived from a campaign link.',
    }),
    defineField({
      name: 'consentIp',
      title: 'IP at signup',
      type: 'string',
      fieldset: 'consent',
      description: 'Kept solely as proof of consent, which is the recognised purpose for holding it. Deleted with the record.',
    }),
    defineField({ name: 'userAgent', title: 'Browser at signup', type: 'string', fieldset: 'consent' }),

    /* ── behaviour ── */
    defineField({
      name: 'interests',
      title: 'What they looked at',
      type: 'array',
      fieldset: 'behaviour',
      description:
        'Product and category pages viewed, counted. Written only while Behaviour consent is on, capped at the 40 most recent, and cleared the moment consent is withdrawn. No dealer item numbers: the site works in STROXX slugs at EU level.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'interest',
          fields: [
            defineField({ name: 'slug', title: 'Product or category', type: 'string' }),
            defineField({ name: 'kind', title: 'Kind', type: 'string' }),
            defineField({ name: 'count', title: 'Views', type: 'number' }),
            defineField({ name: 'lastAt', title: 'Last seen', type: 'datetime' }),
          ],
          preview: { select: { title: 'slug', subtitle: 'count' } },
        }),
      ],
    }),
    defineField({
      name: 'lastSeenAt',
      title: 'Last seen on the site',
      type: 'datetime',
      fieldset: 'behaviour',
    }),

    /* ── sync ── */
    defineField({ name: 'provider', title: 'Email platform', type: 'string', fieldset: 'sync' }),
    defineField({ name: 'providerId', title: 'ID at the platform', type: 'string', fieldset: 'sync' }),
    defineField({ name: 'syncedAt', title: 'Last synced', type: 'datetime', fieldset: 'sync' }),
    defineField({
      name: 'syncError',
      title: 'Last sync error',
      type: 'string',
      fieldset: 'sync',
      description: 'Set when the platform refused the record. The permission itself is still valid: this only means the sending tool has not caught up.',
    }),
  ],
  orderings: [
    { title: 'Newest first', name: 'newest', by: [{ field: 'consentAt', direction: 'desc' }] },
    { title: 'Market, then newest', name: 'market', by: [{ field: 'market', direction: 'asc' }, { field: 'consentAt', direction: 'desc' }] },
  ],
  preview: {
    select: { email: 'email', market: 'marketName', status: 'status', at: 'consentAt', partner: 'partner' },
    prepare: ({ email, market, status, at, partner }: Record<string, string | undefined>) => ({
      title: email || 'Permission record',
      subtitle: [market || '?', partner, status || 'pending', at ? at.slice(0, 10) : ''].filter(Boolean).join(' · '),
    }),
  },
});
