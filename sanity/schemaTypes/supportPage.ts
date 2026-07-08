import { defineField, defineType } from 'sanity';

/** Support & downloads pages: manuals, software guides, brochures. Each page
 *  groups downloads by product/language; editors upload the PDFs straight
 *  into the CMS, so a new manual version is a file swap, no deploy.
 *
 *  IMPORTANT for the stroxx.eu takeover: the packaging QR codes in
 *  circulation point at /pages/smart-locks-st2 and /pages/xlock-software-guide
 *  on the old store. Middleware forwards any /pages/<slug> to /support/<slug>,
 *  so keeping those exact slugs here keeps every printed QR code working. */

export const supportPage = defineType({
  name: 'supportPage',
  title: 'Support page',
  type: 'document',
  description: 'Manuals, guides and downloads for a product. Lives at /support/<slug>.',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'The page headline, e.g. "ST-2 Smart Lock".',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Address (slug)',
      type: 'slug',
      options: { source: 'title' },
      description:
        'The page lives at /support/<slug>. If a QR code on packaging already points at an old /pages/<slug> address, use that EXACT slug and the old code keeps working.',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'intro',
      title: 'Intro',
      type: 'text',
      rows: 2,
      description: 'One or two lines under the headline. What will people find here?',
    }),
    defineField({
      name: 'groups',
      title: 'Download groups',
      type: 'array',
      description: 'One group per language or per document family, e.g. "English" or "ST-2 · Dansk".',
      of: [
        {
          type: 'object',
          name: 'downloadGroup',
          title: 'Group',
          fields: [
            defineField({
              name: 'heading',
              title: 'Group heading',
              type: 'string',
              description: 'e.g. "English", "Dansk", "ST-2 · Deutsch"',
              validation: (r) => r.required(),
            }),
            defineField({
              name: 'items',
              title: 'Downloads',
              type: 'array',
              of: [
                {
                  type: 'object',
                  name: 'downloadItem',
                  title: 'Download',
                  fields: [
                    defineField({
                      name: 'label',
                      title: 'Label',
                      type: 'string',
                      description: 'e.g. "Software guide" or "User instruction, pages 4-7"',
                      validation: (r) => r.required(),
                    }),
                    defineField({
                      name: 'file',
                      title: 'File (PDF)',
                      type: 'file',
                      options: { accept: '.pdf' },
                      description: 'Upload the document. Swapping the file updates every link instantly.',
                    }),
                    defineField({
                      name: 'video',
                      title: 'Video (MP4)',
                      type: 'file',
                      options: { accept: 'video/*' },
                      description: 'Upload a video instead of a PDF. It plays inline on the page. Swapping the file updates the player instantly.',
                    }),
                    defineField({
                      name: 'note',
                      title: 'Note (optional)',
                      type: 'string',
                      description: 'Small print under the label, e.g. an item ref like 102-112-113.',
                    }),
                  ],
                  preview: { select: { title: 'label', subtitle: 'note' } },
                },
              ],
            }),
          ],
          preview: {
            select: { title: 'heading', items: 'items' },
            prepare: ({ title, items }) => ({
              title: title || 'Group',
              subtitle: `${Array.isArray(items) ? items.length : 0} download(s)`,
            }),
          },
        },
      ],
    }),
    defineField({
      name: 'seoTitle',
      title: 'SEO title (optional)',
      type: 'string',
      description: 'Browser tab + Google result title. Empty = the page title.',
    }),
    defineField({
      name: 'seoDescription',
      title: 'SEO description (optional)',
      type: 'text',
      rows: 2,
      description: 'The grey line under the title in Google. One honest sentence about the page.',
    }),
  ],
  preview: {
    select: { title: 'title', slug: 'slug.current' },
    prepare: ({ title, slug }) => ({ title: title || 'Support page', subtitle: `/support/${slug || '…'}` }),
  },
});
