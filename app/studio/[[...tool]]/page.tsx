import { NextStudio } from 'next-sanity/studio';
import config from '../../../sanity.config';

export const dynamic = 'force-static';

export { metadata, viewport } from 'next-sanity/studio';

/** Embedded Sanity Studio at /studio. The `studio-shell` class hides the site
 *  chrome (nav, footer, overlay, FAB) via globals.css, and `data-lenis-prevent`
 *  keeps the smooth-scroll wrapper away from the Studio's own scrolling. */
export default function StudioPage() {
  return (
    <main className="studio-shell fixed inset-0 z-[200] bg-ink" data-lenis-prevent>
      <NextStudio config={config} />
    </main>
  );
}
