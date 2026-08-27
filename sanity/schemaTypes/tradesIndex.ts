import { defineField, defineType } from 'sanity';
import SeoPreviewField from '../SeoPreviewField';
import { langLabel } from '../lib/langLabel';

/** The /trades overview page: its headline, intro and SEO, one document per
 *  language (like the homepage). The trade cards below the intro come from
 *  the Trade page documents automatically, so adding or reordering trades
 *  happens on those, not here. Before 2026-07-12 this copy lived in Site
 *  settings (fagHeadline/fagIntro); it moved here so the page is editable
 *  where an editor would look for it. */

export const tradesIndex = defineType({
  name: 'tradesIndex',
  title: 'Trades overview',
  type: 'document',
  description: 'The /trades overview page: headline, intro and SEO. The trade cards come from the Trade page documents automatically.',
  groups: [
    { name: 'content', title: 'Content', default: true },
    { name: 'seo', title: 'SEO + sharing' },
  ],
  fields: [
    defineField({ name: 'language', type: 'string', readOnly: true, hidden: true }),
    defineField({
      name: 'headline',
      title: 'Headline',
      type: 'string',
      group: 'content',
      description: 'The big h1 on /trades. Wrap the blue words in asterisks: "Your trade. *Your tools.*"',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'intro',
      title: 'Intro',
      type: 'text',
      rows: 3,
      group: 'content',
      description: 'One to three sentences under the headline. The trade cards follow automatically (edit them under Trade pages; each has a Sort order and an Active switch).',
    }),
    defineField({
      name: 'seoTitle',
      title: 'SEO title',
      type: 'string',
      group: 'seo',
      description: 'The title Google and share cards show. Under 60 characters. Empty = a sensible default.',
      validation: (r) => r.max(60).warning('Google cuts titles around 60 characters, so the end of this one will be truncated in results'),
    }),
    defineField({
      name: 'seoDescription',
      title: 'SEO description',
      type: 'text',
      rows: 3,
      group: 'seo',
      description: 'The snippet under the title in Google. Under 155 characters. Empty = a sensible default.',
      validation: (r) => r.max(160).warning('Google cuts descriptions around 155 to 160 characters, so the end of this one will be truncated in results'),
    }),
    defineField({
      name: 'seoPreview',
      title: 'SEO preview (live)',
      description: 'How /trades looks in a Google result and a shared link, built from the fields above as you type. Nothing to fill in here.',
      type: 'string',
      readOnly: true,
      components: { input: SeoPreviewField },
      group: 'seo',
    }),
  ],
  preview: {
    select: { language: 'language' },
    prepare: ({ language }: { language?: string }) => ({
      title: 'Trades overview',
      subtitle: `/trades · ${langLabel(language)}`,
    }),
  },
});
