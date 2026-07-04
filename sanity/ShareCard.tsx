'use client';

import { SITE_URL } from '../lib/site';

/** The mock social link-cards, shared by the Share preview Studio tab and
 *  the live preview at the bottom of every article. Approximations of how
 *  LinkedIn/Facebook/X/WhatsApp render an OG card, on the feed's own light
 *  background so editors see it in context. */

export const PLATFORMS = ['LinkedIn', 'Facebook', 'X', 'WhatsApp', 'Instagram'] as const;
export type Platform = (typeof PLATFORMS)[number];

export const DOMAIN = SITE_URL.replace(/^https?:\/\//, '');

export function shareHref(platform: Platform, url: string, title: string) {
  const u = encodeURIComponent(url);
  switch (platform) {
    case 'LinkedIn':
      return `https://www.linkedin.com/sharing/share-offsite/?url=${u}`;
    case 'Facebook':
      return `https://www.facebook.com/sharer/sharer.php?u=${u}`;
    case 'X':
      return `https://twitter.com/intent/tweet?url=${u}&text=${encodeURIComponent(title)}`;
    case 'WhatsApp':
      return `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`;
    default:
      return '';
  }
}

export function ShareCard({
  platform,
  title,
  desc,
  img,
  url,
}: {
  platform: Platform;
  title: string;
  desc: string;
  img: string | null;
  url: string;
}) {
  if (platform === 'Instagram') {
    return (
      <div style={{ maxWidth: 420, textAlign: 'center', color: '#333', fontSize: 13.5, lineHeight: 1.6, padding: '18px 6px' }}>
        Instagram does not render link cards in the feed. Use the article&#39;s share image as the
        post image, put the link in a Story link sticker or the bio, and reuse the LinkedIn caption
        from Article AI.
      </div>
    );
  }
  const imgBox = (h: number) =>
    img ? (
      /* eslint-disable-next-line @next/next/no-img-element */
      <img src={img} alt="" style={{ width: '100%', height: h, objectFit: 'cover', display: 'block' }} />
    ) : (
      <div style={{ width: '100%', height: h, background: '#d8d8d3', display: 'grid', placeItems: 'center', color: '#666', fontSize: 13, textAlign: 'center', padding: '0 16px' }}>
        No share image yet: upload one on the article (Share image or Hero image)
      </div>
    );
  if (platform === 'LinkedIn')
    return (
      <div style={{ width: 440, maxWidth: '100%', background: '#fff', border: '1px solid #e0dfdc', borderRadius: 8, overflow: 'hidden', fontFamily: 'system-ui, sans-serif' }}>
        {imgBox(230)}
        <div style={{ padding: '10px 14px', background: '#eef3f8' }}>
          <div style={{ color: '#000000e6', fontSize: 14, fontWeight: 600, lineHeight: 1.35, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{title}</div>
          <div style={{ color: '#00000099', fontSize: 12, marginTop: 4 }}>{DOMAIN}</div>
        </div>
      </div>
    );
  if (platform === 'Facebook')
    return (
      <div style={{ width: 440, maxWidth: '100%', background: '#fff', border: '1px solid #dadde1', overflow: 'hidden', fontFamily: 'system-ui, sans-serif' }}>
        {imgBox(230)}
        <div style={{ padding: '10px 12px', background: '#f0f2f5' }}>
          <div style={{ color: '#65676b', fontSize: 12, textTransform: 'uppercase' }}>{DOMAIN}</div>
          <div style={{ color: '#050505', fontSize: 15, fontWeight: 600, lineHeight: 1.3, marginTop: 3 }}>{title}</div>
          <div style={{ color: '#65676b', fontSize: 13, marginTop: 3, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical' }}>{desc}</div>
        </div>
      </div>
    );
  if (platform === 'X')
    return (
      <div style={{ width: 440, maxWidth: '100%', position: 'relative', borderRadius: 16, overflow: 'hidden', border: '1px solid #cfd9de', fontFamily: 'system-ui, sans-serif' }}>
        {imgBox(240)}
        <div style={{ position: 'absolute', left: 10, bottom: 10, background: 'rgba(0,0,0,0.75)', color: '#fff', fontSize: 12.5, padding: '2px 8px', borderRadius: 4, maxWidth: '85%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {title}
        </div>
      </div>
    );
  /* WhatsApp */
  return (
    <div style={{ width: 380, maxWidth: '100%', background: '#d9fdd3', borderRadius: 10, padding: 6, fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ background: '#d1f4cc', borderRadius: 8, overflow: 'hidden' }}>
        {imgBox(190)}
        <div style={{ padding: '8px 10px' }}>
          <div style={{ color: '#111b21', fontSize: 13.5, fontWeight: 600, lineHeight: 1.3 }}>{title}</div>
          <div style={{ color: '#54656f', fontSize: 12.5, marginTop: 2, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{desc}</div>
          <div style={{ color: '#8696a0', fontSize: 11.5, marginTop: 3 }}>{DOMAIN}</div>
        </div>
      </div>
      <div style={{ color: '#027eb5', fontSize: 13, padding: '6px 10px 4px', wordBreak: 'break-all' }}>{url}</div>
    </div>
  );
}
