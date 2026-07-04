'use client';

import { useState } from 'react';
import { useFormValue } from 'sanity';
import { SITE_URL } from '../lib/site';
import { assetUrl } from './lib/image';
import { ShareCard, PLATFORMS, type Platform } from './ShareCard';

/** Live share preview at the BOTTOM OF EVERY ARTICLE in the Studio: renders
 *  the link card from what is in the form RIGHT NOW (unsaved edits included),
 *  using the article's own share image → hero image cascade. Editors see
 *  exactly what LinkedIn/Facebook/X/WhatsApp will show before they publish,
 *  without leaving the document. The field stores nothing. */

export default function SharePreviewField() {
  const [platform, setPlatform] = useState<Platform>('LinkedIn');

  /* hooks are called unconditionally (rules of hooks), fallbacks applied after */
  const seoTitle = useFormValue(['seoTitle']) as string | undefined;
  const headline = useFormValue(['title']) as string | undefined;
  const seoDescription = useFormValue(['seoDescription']) as string | undefined;
  const excerpt = useFormValue(['excerpt']) as string | undefined;
  const ogImage = useFormValue(['ogImage']);
  const heroImage = useFormValue(['heroImage']);
  const slug = (useFormValue(['slug']) as { current?: string } | undefined)?.current || '';
  const title = seoTitle || headline || '';
  const desc = seoDescription || excerpt || '';

  const img = assetUrl(ogImage, 1200) || assetUrl(heroImage, 1200);
  const url = `${SITE_URL}/nyheder/${slug}`;

  const pill = (on: boolean) =>
    ({
      padding: '6px 13px',
      borderRadius: 999,
      border: on ? '1px solid #2276fc' : '1px solid rgba(128,128,128,0.35)',
      background: on ? 'rgba(34,118,252,0.12)' : 'transparent',
      color: 'inherit',
      cursor: 'pointer',
      fontSize: 12.5,
      fontWeight: on ? 600 : 400,
    }) as const;

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
        {PLATFORMS.map((p) => (
          <button key={p} type="button" style={pill(platform === p)} onClick={() => setPlatform(p)}>
            {p}
          </button>
        ))}
      </div>
      <div style={{ background: '#f3f2ef', borderRadius: 12, padding: 22, display: 'flex', justifyContent: 'center' }}>
        <ShareCard platform={platform} title={title} desc={desc} img={img} url={url} />
      </div>
      <p style={{ fontSize: 11.5, opacity: 0.6, lineHeight: 1.5, marginTop: 10 }}>
        Built live from this article&#39;s SEO title and share image (own share image first, then the
        hero). Thin card? Fix those fields above. The Share preview tab has the share buttons.
      </p>
    </div>
  );
}
