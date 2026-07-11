import type { MetadataRoute } from 'next';

/** Web app manifest → the site is installable as a PWA (home-screen icon,
 *  standalone fullscreen, no browser chrome). No service worker yet by
 *  choice: offline support is a production decision, installability is free. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'STROXX | Premium tools, beastly low prices',
    short_name: 'STROXX',
    description:
      'Professional tools without the brand markup. Find products and your nearest store.',
    id: '/',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#0B0C0E',
    theme_color: '#0B0C0E',
    lang: 'en',
    categories: ['shopping', 'business'],
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    shortcuts: [
      { name: 'Find a store', url: '/stores', description: 'Nearest STROXX dealer' },
      { name: 'Products', url: '/products', description: 'The full range' },
      { name: 'Try It', url: '/try-it', description: 'Campaign and guarantee' },
    ],
  };
}
