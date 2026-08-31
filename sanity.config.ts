'use client';

import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { structure } from './sanity/structure';
import { presentationTool, defineLocations } from 'sanity/presentation';
import { BookIcon, BulbOutlineIcon, BarChartIcon, SparklesIcon, HelpCircleIcon } from '@sanity/icons';
import { schemaTypes } from './sanity/schemaTypes';
import { documentInternationalization } from '@sanity/document-internationalization';
import { supportedLanguages } from './lib/i18n';
import { projectId, dataset } from './sanity/env';
import GuideTool from './sanity/GuideTool';
import BrandTool from './sanity/BrandTool';
import WelcomeTool from './sanity/WelcomeTool';
import ArticleAgentTool from './sanity/ArticleAgentTool';
import DashboardTool from './sanity/DashboardTool';
import HelpTool from './sanity/HelpTool';
import { seePageAction, openInPresentationAction } from './sanity/SeePageAction';
import { wrapPublishWithRedirect, REDIRECTABLE } from './sanity/slugRedirectAction';

/** Embedded Studio config, served at /studio (app/studio/[[...tool]]).
 *  Presentation = the visual editing workspace: the live site in an iframe,
 *  click any text to jump to its field. */
export default defineConfig({
  name: 'stroxx',
  title: 'STROXX',
  projectId,
  dataset,
  basePath: '/studio',
  plugins: [
    presentationTool({
      title: 'Edit site',
      previewUrl: { previewMode: { enable: '/api/draft-mode/enable' } },
      resolve: {
        locations: {
          landingPage: defineLocations({
            select: { title: 'title', slug: 'slug.current' },
            resolve: (doc) => ({
              locations: [
                {
                  title: doc?.title || 'Landing page',
                  // try-it keeps its short route; new pages live under /campaign/
                  href: doc?.slug === 'try-it' ? '/try-it' : `/campaign/${doc?.slug || ''}`,
                },
              ],
            }),
          }),
          post: defineLocations({
            select: { title: 'title', slug: 'slug.current' },
            resolve: (doc) => ({
              locations: [
                { title: doc?.title || 'Article', href: `/news/${doc?.slug || ''}` },
                { title: 'News index', href: '/news' },
              ],
            }),
          }),
          monthlyLineup: defineLocations({
            select: { month: 'month', period: 'period', activeFrom: 'activeFrom' },
            resolve: (doc) => {
              const period = (doc?.period || (doc?.activeFrom ? String(doc.activeFrom).slice(0, 7) : '')) as string;
              return {
                locations: [
                  { title: `Månedens STROXX (${doc?.month || ''})`, href: '/monthly' },
                  ...(period ? [{ title: `Its permanent address (/monthly/${period})`, href: `/monthly/${period}` }] : []),
                  { title: 'Archive of past months', href: '/monthly/archive' },
                  { title: 'Homepage section', href: '/#monthly' },
                ],
              };
            },
          }),
          campaign: defineLocations({
            select: { name: 'name', slug: 'link.slug.current' },
            resolve: (doc) => ({
              locations: [
                { title: `${doc?.name || 'Campaign'} on the front page`, href: '/' },
                ...(doc?.slug ? [{ title: 'Its campaign page', href: `/campaign/${doc.slug}` }] : []),
              ],
            }),
          }),
          siteSettings: defineLocations({
            select: {},
            resolve: () => ({ locations: [{ title: 'Footer (all pages)', href: '/' }] }),
          }),
          homePage: defineLocations({
            select: {},
            resolve: () => ({ locations: [{ title: 'Homepage', href: '/' }] }),
          }),
          store: defineLocations({
            select: { name: 'name' },
            resolve: (doc) => ({
              locations: [{ title: doc?.name || 'Store', href: '/stores' }],
            }),
          }),
          specialist: defineLocations({
            select: { name: 'name' },
            resolve: (doc) => ({
              locations: [{ title: `${doc?.name || 'Specialist'} (homepage cards)`, href: '/#specialists' }],
            }),
          }),
          tradesIndex: defineLocations({
            select: {},
            resolve: () => ({ locations: [{ title: 'Trades overview', href: '/trades' }] }),
          }),
          trade: defineLocations({
            select: { name: 'name', slug: 'slug.current' },
            resolve: (doc) => ({
              locations: [
                { title: `${doc?.name || 'Trade'} (trade page)`, href: `/trades/${doc?.slug || ''}` },
                { title: 'Trades index', href: '/trades' },
              ],
            }),
          }),
          testimonial: defineLocations({
            select: {},
            resolve: () => ({ locations: [{ title: 'Campaign: Try It (testimonials)', href: '/try-it' }] }),
          }),
          video: defineLocations({
            select: { title: 'title' },
            resolve: (doc) => ({
              locations: [{ title: `${doc?.title || 'Film'} (Try It, film section)`, href: '/try-it' }],
            }),
          }),
          legalPage: defineLocations({
            select: { slug: 'slug', title: 'title' },
            resolve: (doc) => ({
              locations: [{ title: doc?.title || 'Legal page', href: `/${doc?.slug || ''}` }],
            }),
          }),
          supportPage: defineLocations({
            select: { title: 'title', slug: 'slug.current' },
            resolve: (doc) => ({
              locations: [
                { title: doc?.title || 'Support page', href: `/support/${doc?.slug || ''}` },
                { title: 'Support index', href: '/support' },
              ],
            }),
          }),
        },
      },
    }),
    structureTool({ title: 'Content', structure }),
    documentInternationalization({
      supportedLanguages,
      schemaTypes: ['homePage', 'siteSettings', 'landingPage', 'campaign', 'supportPage', 'post', 'legalPage', 'monthlyLineup', 'trade', 'tradesIndex', 'productAugment', 'specialist', 'testimonial', 'video'],
      languageField: 'language',
    }),
  ],
  schema: { types: schemaTypes },
  document: {
    /* Per-document actions: quick "See page" (new tab) + "Open in Edit site"
       on every page type, and auto-301-on-slug-change for the slug-bearing
       ones (wraps Publish; see sanity/slugRedirectAction). */
    actions: (prev, context) => {
      type Named = (typeof prev)[number] & { action?: string };
      const base = REDIRECTABLE.has(context.schemaType)
        ? prev.map((a) => ((a as Named).action === 'publish' ? wrapPublishWithRedirect(a) : a))
        : prev;
      return [...base, seePageAction, openInPresentationAction];
    },
    /* Two types must never be creatable by hand from the global Create menu.
       `dataSources` is a SINGLETON: a second copy would sit at a random ID that
       the structure never shows, so IT would fill in a document nobody reads.
       `permission` is EVIDENCE: it is written by the signup route and marked
       readOnly, but readOnly only disables the form, it does not remove the
       type from the create menu, and a hand-made consent record is exactly the
       thing that must not exist. */
    newDocumentOptions: (prev) => prev.filter((t) => t.templateId !== 'dataSources' && t.templateId !== 'permission'),
  },
  /* the editor guide as its own Studio tab, always the deployed version */
  tools: (prev) => [...prev, { name: 'welcome', title: 'Welcome', icon: SparklesIcon, component: WelcomeTool },
    { name: 'help', title: 'Help', icon: HelpCircleIcon, component: HelpTool },
    { name: 'guide', title: 'Guide', icon: BookIcon, component: GuideTool },
    { name: 'brand', title: 'Brand', icon: BookIcon, component: BrandTool },
    { name: 'article-ai', title: 'Article AI', icon: BulbOutlineIcon, component: ArticleAgentTool },
    /* the old "Share preview" tab was retired Jul 5 2026: the same live card
       sits at the bottom of every article, and SEO previews live under the
       SEO fields on Site settings + landing pages (SeoPreviewField) */
    { name: 'dashboard', title: 'Dashboard', icon: BarChartIcon, component: DashboardTool }],
});
