import type { MetadataRoute } from 'next';

/** Web app manifest → the site is installable as a PWA (home-screen icon,
 *  standalone fullscreen, no browser chrome). No service worker yet by
 *  choice: offline support is a production decision, installability is free. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'STROXX — Dyrt værktøj til udyr pris',
    short_name: 'STROXX',
    description:
      'Professionelt værktøj uden mærke-tillæg. Find produkter, priser og din nærmeste butik.',
    id: '/',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#0B0C0E',
    theme_color: '#0B0C0E',
    lang: 'da',
    categories: ['shopping', 'business'],
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    shortcuts: [
      { name: 'Find butik', url: '/butikker', description: 'Nærmeste STROXX-forhandler' },
      { name: 'Produkter', url: '/produkter', description: 'Hele sortimentet' },
      { name: 'Prøv det', url: '/proev-det', description: 'Kampagne og garanti' },
    ],
  };
}
