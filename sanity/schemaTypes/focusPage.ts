import { defineField, defineType } from 'sanity';
import SeoPreviewField from '../SeoPreviewField';
import { langLabel } from '../lib/langLabel';
import { landingSectionMembers } from './landingPage';

/** "Focus on…" (Fokus på…): one page per focus product, the successor of the
 *  Webflow fokus-paa pages. Localisation class 1 (TRANSLATABLE): one document
 *  per language, `language` stamped by the internationalization plugin.
 *
 *  The page is built from the SAME section blocks as landing pages, plus the
 *  card fields below that feed the filterable /focus-on overview and the
 *  "More focus products" strip at the bottom of every focus page. Nothing to
 *  copy by hand per page, unlike Webflow.
 *
 *  Address: /focus-on/<slug> (English slugs only, every market; the Danish
 *  site shows the Danish document at /dk/focus-on/<slug> or stroxx.dk/focus-on/<slug>). */
export const focusPage = defineType({
  name: 'focusPage',
  title: 'Focus page',
  type: 'document',
  groups: [
    { name: 'card', title: 'Card + filters', default: true },
    { name: 'content', title: 'Page sections' },
    { name: 'seo', title: 'SEO + sharing' },
  ],
  fields: [
    defineField({ name: 'language', type: 'string', readOnly: true, hidden: true }),
    defineField({
      name: 'title',
      title: 'Product name',
      type: 'string',
      group: 'card',
      description: 'Shown on the overview card and in the "More focus products" strip, e.g. "LED strip on cable reel".',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'slug',
      title: 'URL slug',
      type: 'slug',
      group: 'card',
      description:
        'English, lowercase, dashes: "led-strip-cable-reel" publishes at /focus-on/led-strip-cable-reel. Keep the SAME slug on every language version. Changing it later creates a redirect automatically when you publish.',
      options: {
        source: 'title',
        slugify: (input: string) =>
          input
            .toLowerCase()
            .normalize('NFKD')
            .replace(/æ/g, 'ae')
            .replace(/ø/g, 'oe')
            .replace(/å/g, 'aa')
            .replace(/[̀-ͯ]/g, '')
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '')
            .replace(/-+/g, '-')
            .slice(0, 80),
      },
      validation: (r) =>
        r.required().custom((s: { current?: string } | undefined) =>
          !s?.current || /^[a-z0-9]+(-[a-z0-9]+)*$/.test(s.current) ? true : 'Lowercase letters, numbers and single dashes only',
        ),
    }),
    defineField({
      name: 'month',
      title: 'Focus month',
      type: 'date',
      group: 'card',
      description:
        'The first day of the month this product is in focus, e.g. 2026-10-01. Orders the overview (newest first) and decides the "Current" badge: the newest month that has started. A later month shows as "Coming".',
      options: { dateFormat: 'YYYY-MM-DD' },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'teaser',
      title: 'Teaser',
      type: 'text',
      rows: 2,
      group: 'card',
      description: 'One sentence on the overview card. Under 120 characters reads best.',
      validation: (r) => r.max(160).warning('Long teasers get cut on the card'),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'reference',
      to: [{ type: 'focusCategory' }],
      group: 'card',
      description: 'The main filter on the overview, e.g. Lighting or Security. Pick one in this page’s language. Missing? Create it under Focus on → Categories.',
      options: { filter: ({ document }) => ({ filter: 'language == $lang', params: { lang: (document as { language?: string }).language || 'en' } }) },
    }),
    defineField({
      name: 'tags',
      title: 'Topics (optional)',
      type: 'array',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
      group: 'card',
      description: 'Free tags, e.g. "work light", "access". The overview shows a topic filter once at least two topics are in use.',
    }),
    defineField({
      name: 'cardImage',
      title: 'Card photo',
      type: 'image',
      options: { hotspot: true },
      group: 'card',
      description: 'The photo on the overview card, landscape 3:2. Empty = the product cut-out below on a dark card.',
      fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string' })],
    }),
    defineField({
      name: 'cutout',
      title: 'Product cut-out (transparent PNG/WebP)',
      type: 'image',
      group: 'card',
      description: 'The product on a transparent background. Used on the card when there is no card photo.',
      fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string' })],
    }),
    defineField({
      name: 'itemNumbers',
      title: 'Item numbers on this page (optional)',
      type: 'array',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
      group: 'card',
      description: 'The focus product’s item numbers (varenumre). Used by the AI page builder to pull product data, and for search.',
    }),
    defineField({
      name: 'sections',
      title: 'Sections',
      type: 'array',
      group: 'content',
      description: 'Build the page from blocks, exactly like a campaign page. The "More focus products" strip is added automatically at the bottom.',
      of: landingSectionMembers,
    }),
    defineField({
      name: 'hideMoreStrip',
      title: 'Hide the "More focus products" strip',
      type: 'boolean',
      group: 'content',
      initialValue: false,
    }),
    defineField({
      name: 'seoTitle',
      title: 'SEO title',
      type: 'string',
      group: 'seo',
      description: 'Under 60 characters. Empty = the product name.',
      validation: (r) => r.max(60).warning('Google cuts titles around 60 characters'),
    }),
    defineField({
      name: 'seoDescription',
      title: 'SEO description',
      type: 'text',
      rows: 3,
      group: 'seo',
      description: 'Under 155 characters. Empty = the teaser.',
      validation: (r) => r.max(160).warning('Google cuts descriptions around 155 to 160 characters'),
    }),
    defineField({
      name: 'ogImage',
      title: 'Share image (social)',
      type: 'image',
      options: { hotspot: true },
      group: 'seo',
      description: '1200x630. Empty = the card photo.',
    }),
    defineField({
      name: 'seoPreview',
      title: 'SEO preview (live)',
      type: 'string',
      readOnly: true,
      components: { input: SeoPreviewField },
      group: 'seo',
    }),
  ],
  orderings: [{ title: 'Focus month, newest first', name: 'monthDesc', by: [{ field: 'month', direction: 'desc' }] }],
  preview: {
    select: { title: 'title', slug: 'slug.current', language: 'language', month: 'month', media: 'cardImage' },
    prepare: ({ title, slug, language, month, media }: { title?: string; slug?: string; language?: string; month?: string; media?: never }) => ({
      title: title || 'Focus page',
      subtitle: `/focus-on/${slug || '…'} · ${month ? month.slice(0, 7) : 'no month'} · ${langLabel(language)}`,
      media,
    }),
  },
});

/** Overview filter categories. Translatable like everything editors read, but
 *  the KEY is shared across languages so a filter link means the same thing in
 *  every market ("lighting" is Belysning in Danish, Lighting in English). */
export const focusCategory = defineType({
  name: 'focusCategory',
  title: 'Focus category',
  type: 'document',
  fields: [
    defineField({ name: 'language', type: 'string', readOnly: true, hidden: true }),
    defineField({ name: 'title', title: 'Name', type: 'string', description: 'As shown on the filter, in this language, e.g. Belysning.', validation: (r) => r.required() }),
    defineField({
      name: 'key',
      title: 'Filter key',
      type: 'string',
      description: 'English, lowercase, one word or dashes, the SAME on every language version: lighting, security, power-tools. Used in filter links (/focus-on?category=lighting).',
      validation: (r) => r.required().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, { name: 'key' }).error('Lowercase English, dashes only, e.g. lighting'),
    }),
    defineField({ name: 'order', title: 'Order (optional)', type: 'number', description: 'Lower numbers first. Empty = alphabetical.' }),
  ],
  preview: {
    select: { title: 'title', key: 'key', language: 'language' },
    prepare: ({ title, key, language }: { title?: string; key?: string; language?: string }) => ({
      title: title || 'Category',
      subtitle: `${key || '…'} · ${langLabel(language)}`,
    }),
  },
});
