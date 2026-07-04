import { defineField, defineType } from 'sanity';

/** Test feedback / bug reports, submitted by the hidden /test page and
 *  reviewed here in the Studio: open one, read it, set the status, done.
 *  The Studio never creates these by hand; the form does. Device and page
 *  context are captured automatically so "looks weird on my phone" arrives
 *  with the technical details testers never think to include. */

export const feedback = defineType({
  name: 'feedback',
  title: 'Feedback (test reports)',
  type: 'document',
  description: 'Reports from the /test page. Triage by status; nothing here is ever shown on the site.',
  fields: [
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: 'New', value: 'new' },
          { title: 'Reviewed', value: 'reviewed' },
          { title: 'Fixed', value: 'fixed' },
          { title: "Won't fix", value: 'wont-fix' },
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
      initialValue: 'new',
    }),
    defineField({
      name: 'kind',
      title: 'Type',
      type: 'string',
      options: {
        list: [
          { title: 'Bug', value: 'bug' },
          { title: 'Idea', value: 'idea' },
          { title: 'Other', value: 'other' },
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
      readOnly: true,
    }),
    defineField({ name: 'message', title: 'Report', type: 'text', rows: 6, readOnly: true }),
    defineField({
      name: 'page',
      title: 'Where on the site',
      type: 'string',
      readOnly: true,
      description: 'The page the tester was describing (their words, not tracked).',
    }),
    defineField({ name: 'reporter', title: 'Name', type: 'string', readOnly: true }),
    defineField({ name: 'email', title: 'Email (for follow-up)', type: 'string', readOnly: true }),
    defineField({
      name: 'device',
      title: 'Device / browser (auto-captured)',
      type: 'string',
      readOnly: true,
    }),
    defineField({
      name: 'screenshot',
      title: 'Screenshot (attached by the tester)',
      type: 'image',
      readOnly: true,
    }),
    defineField({
      name: 'note',
      title: 'Internal note',
      type: 'text',
      rows: 3,
      description: 'Your triage notes: cause, decision, follow-up. Testers never see this.',
    }),
  ],
  orderings: [
    { title: 'Newest first', name: 'newest', by: [{ field: '_createdAt', direction: 'desc' }] },
    { title: 'By status', name: 'status', by: [{ field: 'status', direction: 'asc' }, { field: '_createdAt', direction: 'desc' }] },
  ],
  preview: {
    select: { title: 'message', status: 'status', kind: 'kind', reporter: 'reporter', media: 'screenshot' },
    prepare({ title, status, kind, reporter, media }) {
      const flag = status === 'new' ? '● ' : status === 'fixed' ? '✓ ' : '';
      return {
        title: `${flag}${(title || 'Empty report').slice(0, 80)}`,
        subtitle: [kind, status, reporter].filter(Boolean).join(' · '),
        media,
      };
    },
  },
});
