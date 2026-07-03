'use client';

import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { presentationTool, defineLocations } from 'sanity/presentation';
import { schemaTypes } from './sanity/schemaTypes';
import { projectId, dataset } from './sanity/env';

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
        },
      },
    }),
    structureTool({ title: 'Content' }),
  ],
  schema: { types: schemaTypes },
});
