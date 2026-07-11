'use client';

import { useFormValue } from 'sanity';
import { SITE_URL } from '../lib/site';
import { localeById } from '../lib/i18n';
import { assetUrl } from './lib/image';
import { ShareCard, DOMAIN } from './ShareCard';

/** Live SEO preview rendered UNDER the SEO fields (Site settings and landing
 *  pages): a Google-style result snippet plus a LinkedIn-style link card,
 *  rebuilt from the form values as you type, with character budgets. The
 *  field stores nothing. ogImage may be a string path (Site settings) or an
 *  uploaded image (landing pages); both render. */

const LIGHT = {
  card: { background: '#fff', borderRadius: 10, padding: '14px 16px', maxWidth: 600 },
  url: { color: '#202124', fontSize: 12.5, lineHeight: 1.3 },
  title: { color: '#1a0dab', fontSize: 18, lineHeight: 1.3, margin: '2px 0 3px', fontWeight: 400 },
  desc: { color: '#4d5156', fontSize: 13.5, lineHeight: 1.5 },
} as const;

function budget(n: number, max: number) {
  const over = n > max;
  return (
    <span style={{ color: over ? '#e8590c' : 'inherit', opacity: over ? 1 : 0.65 }}>
      {n}/{max}
      {over ? ' · will be cut off' : ''}
    </span>
  );
}

export default function SeoPreviewField() {
  const seoTitle = useFormValue(['seoTitle']) as string | undefined;
  const seoDescription = useFormValue(['seoDescription']) as string | undefined;
  const ogImage = useFormValue(['ogImage']);
  const sections = useFormValue(['sections']) as
    | Array<{ _type?: string; imageUpload?: unknown; image?: unknown }>
    | undefined; // landing pages: fall back to the hero image
  const docTitle = useFormValue(['title']) as string | undefined; // landing pages
  const slug = (useFormValue(['slug']) as { current?: string } | undefined)?.current;
  const language = useFormValue(['language']) as string | undefined;

  const title = seoTitle || docTitle || 'The SEO title goes here';
  const desc = seoDescription || 'The description Google shows under the title. Fill the field above and watch it land here.';
  // Resolve a root-relative og path against wherever the Studio is running
  // (localhost in dev, the real domain in prod) so the preview image loads,
  // instead of the placeholder SITE_URL which may not serve it. SSR fallback = SITE_URL.
  const origin = typeof window !== 'undefined' ? window.location.origin : SITE_URL;
  const explicit =
    typeof ogImage === 'string'
      ? (ogImage ? (ogImage.startsWith('/') ? `${origin}${ogImage}` : ogImage) : undefined)
      : assetUrl(ogImage, 1200) || undefined;
  // Landing pages: no explicit share image → fall back to the hero (upload,
  // then /public path), mirroring the live /kampagne route so the preview
  // shows exactly what would actually be shared.
  const hero = sections?.find((s) => s?._type === 'photoHero');
  const heroPath = typeof hero?.image === 'string' ? hero.image : undefined;
  const img =
    explicit ||
    assetUrl(hero?.imageUpload, 1200) ||
    (heroPath && heroPath.startsWith('/') ? `${origin}${heroPath}` : undefined);
  // Prefix the path with the document language's market path (/dk, /be/nl, ...),
  // so a translated document previews its own market's live URL, not the root.
  const langPrefix = localeById(language)?.path ?? '';
  const pagePath = slug ? (slug === 'proev-det' ? '/proev-det' : `/kampagne/${slug}`) : '/';
  const path = langPrefix ? `${langPrefix}${pagePath === '/' ? '' : pagePath}` : pagePath;
  const url = `${SITE_URL}${path}`;

  return (
    <div style={{ display: 'grid', gap: 14, fontFamily: 'inherit' }}>
      <div style={{ fontSize: 12.5, opacity: 0.8 }}>
        Google result · title {budget(title.length, 60)} · description {budget(desc.length, 160)}
      </div>
      <div style={LIGHT.card}>
        <div style={LIGHT.url}>
          {DOMAIN}
          {path !== '/' ? ` › ${path.split('/').filter(Boolean).join(' › ')}` : ''}
        </div>
        <div style={{ ...LIGHT.title, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</div>
        <div style={LIGHT.desc}>{desc.slice(0, 300)}</div>
      </div>
      <div style={{ fontSize: 12.5, opacity: 0.8 }}>Shared link (LinkedIn-style card)</div>
      <ShareCard platform="LinkedIn" title={title} desc={desc} img={img ?? null} url={url} />
      {!img && (
        <div style={{ fontSize: 12.5, opacity: 0.8 }}>
          No share image set, platforms will show a bare text card. 1200x630 works best.
        </div>
      )}
    </div>
  );
}
