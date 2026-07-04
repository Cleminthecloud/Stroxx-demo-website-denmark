'use client';

import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { presentationTool, defineLocations } from 'sanity/presentation';
import { BookIcon, BulbOutlineIcon, ShareIcon, BarChartIcon, SparklesIcon } from '@sanity/icons';
import { schemaTypes } from './sanity/schemaTypes';
import { projectId, dataset } from './sanity/env';
import GuideTool from './sanity/GuideTool';
import WelcomeTool from './sanity/WelcomeTool';
import ArticleAgentTool from './sanity/ArticleAgentTool';
import SharePreviewTool from './sanity/SharePreviewTool';
import DashboardTool from './sanity/DashboardTool';

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
                  // proev-det keeps its historic route; new pages live under /kampagne/
                  href: doc?.slug === 'proev-det' ? '/proev-det' : `/kampagne/${doc?.slug || ''}`,
                },
              ],
            }),
          }),
          post: defineLocations({
            select: { title: 'title', slug: 'slug.current' },
            resolve: (doc) => ({
              locations: [
                { title: doc?.title || 'Article', href: `/nyheder/${doc?.slug || ''}` },
                { title: 'News index', href: '/nyheder' },
              ],
            }),
          }),
          monthlyLineup: defineLocations({
            select: { month: 'month' },
            resolve: (doc) => ({
              locations: [
                { title: `Månedens STROXX (${doc?.month || ''})`, href: '/maanedens' },
                { title: 'Homepage section', href: '/#maanedens' },
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
              locations: [{ title: doc?.name || 'Store', href: '/butikker' }],
            }),
          }),
          specialist: defineLocations({
            select: { name: 'name' },
            resolve: (doc) => ({
              locations: [{ title: `${doc?.name || 'Specialist'} (homepage cards)`, href: '/#specialister' }],
            }),
          }),
          testimonial: defineLocations({
            select: {},
            resolve: () => ({ locations: [{ title: 'Campaign: Try It (testimonials)', href: '/proev-det' }] }),
          }),
          video: defineLocations({
            select: { title: 'title' },
            resolve: (doc) => ({
              locations: [{ title: `${doc?.title || 'Film'} (Try It, film section)`, href: '/proev-det' }],
            }),
          }),
          legalPage: defineLocations({
            select: { slug: 'slug', title: 'title' },
            resolve: (doc) => ({
              locations: [{ title: doc?.title || 'Legal page', href: `/${doc?.slug || ''}` }],
            }),
          }),
        },
      },
    }),
    structureTool({ title: 'Content' }),
  ],
  schema: { types: schemaTypes },
  /* the editor guide as its own Studio tab, always the deployed version */
  tools: (prev) => [...prev, { name: 'welcome', title: 'Welcome', icon: SparklesIcon, component: WelcomeTool },
    { name: 'guide', title: 'Guide', icon: BookIcon, component: GuideTool },
    { name: 'article-ai', title: 'Article AI', icon: BulbOutlineIcon, component: ArticleAgentTool },
    { name: 'dashboard', title: 'Dashboard', icon: BarChartIcon, component: DashboardTool },
    { name: 'share-preview', title: 'Share preview', icon: ShareIcon, component: SharePreviewTool }],
});
