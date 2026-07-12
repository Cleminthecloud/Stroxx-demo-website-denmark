'use client';

import { usePathname } from 'next/navigation';

/** Renders its children on the SITE only, never under /studio. The embedded
 *  Studio shares the root layout with the site, so without this guard the
 *  site's live-content listener (SanityLive) also runs behind the Studio:
 *  every edit an editor makes fires a live event, the listener refreshes the
 *  host page, and the Studio blinks, jumps, or drops an open modal mid-typing.
 *  The Presentation tool is unaffected: it previews the site in an iframe on
 *  site routes, where the live listener and overlays still mount. */
export default function SiteOnly({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname === '/studio' || pathname?.startsWith('/studio/')) return null;
  return <>{children}</>;
}
