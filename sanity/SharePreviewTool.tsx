'use client';

import { useEffect, useMemo, useState } from 'react';
import { useClient } from 'sanity';
import { SITE_URL } from '../lib/site';
import { assetUrl } from './lib/image';

/** "Share preview" Studio tab: pick a published article, pick a platform,
 *  and see (approximately) how the link card will render there, built from
 *  the article's real OG data (SEO title, description, share image cascade
 *  own og → hero). The share button matches the chosen platform. */

type PostRow = {
  _id: string;
  title?: string;
  slug?: { current?: string };
  excerpt?: string;
  seoTitle?: string;
  seoDescription?: string;
  heroImage?: unknown;
  ogImage?: unknown;
};

const PLATFORMS = ['LinkedIn', 'Facebook', 'X', 'WhatsApp', 'Instagram'] as const;
type Platform = (typeof PLATFORMS)[number];

const DOMAIN = SITE_URL.replace(/^https?:\/\//, '');

function shareHref(platform: Platform, url: string, title: string) {
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

export default function SharePreviewTool() {
  const client = useClient({ apiVersion: '2026-07-01' });
  const [posts, setPosts] = useState<PostRow[]>([]);
  const [id, setId] = useState('');
  const [platform, setPlatform] = useState<Platform>('LinkedIn');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client
      .fetch<PostRow[]>(
        `*[_type == "post" && !(_id in path("drafts.**")) && defined(slug.current)] | order(publishedAt desc){_id, title, slug, excerpt, seoTitle, seoDescription, heroImage, ogImage}`
      )
      .then((r) => {
        setPosts(r || []);
        if (r?.[0]) setId(r[0]._id);
      })
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, [client]);

  const post = useMemo(() => posts.find((p) => p._id === id) || null, [posts, id]);
  const url = post ? `${SITE_URL}/nyheder/${post.slug?.current}` : '';
  const title = post?.seoTitle || post?.title || '';
  const desc = post?.seoDescription || post?.excerpt || '';
  const img = post ? assetUrl(post.ogImage, 1200) || assetUrl(post.heroImage, 1200) : null;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  const S = {
    wrap: { maxWidth: 760, margin: '0 auto', padding: '32px 24px 80px' } as const,
    row: { display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', marginBottom: 14 } as const,
    select: { padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(128,128,128,0.35)', background: 'transparent', color: 'inherit', fontSize: 13, maxWidth: '100%' } as const,
    pill: (on: boolean) =>
      ({
        padding: '7px 14px',
        borderRadius: 999,
        border: on ? '1px solid #2276fc' : '1px solid rgba(128,128,128,0.35)',
        background: on ? 'rgba(34,118,252,0.12)' : 'transparent',
        color: 'inherit',
        cursor: 'pointer',
        fontSize: 13,
        fontWeight: on ? 600 : 400,
      }) as const,
    btn: {
      padding: '9px 18px', borderRadius: 999, border: 'none', background: '#2276fc',
      color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', textDecoration: 'none', display: 'inline-block',
    } as const,
    ghost: {
      padding: '9px 18px', borderRadius: 999, border: '1px solid rgba(128,128,128,0.4)', background: 'transparent',
      color: 'inherit', fontSize: 13, cursor: 'pointer',
    } as const,
    note: { fontSize: 12, opacity: 0.65, lineHeight: 1.5, marginTop: 14 } as const,
    /* the mock cards render on white like the real feeds */
    stage: { background: '#f3f2ef', borderRadius: 14, padding: 28, marginTop: 18, display: 'flex', justifyContent: 'center' } as const,
  };

  const card = () => {
    if (!post) return null;
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
        <div style={{ width: '100%', height: h, background: '#d8d8d3', display: 'grid', placeItems: 'center', color: '#666', fontSize: 13 }}>
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
  };

  return (
    <div style={S.wrap}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Share preview</h1>
      <p style={{ fontSize: 13, opacity: 0.75, marginBottom: 20, lineHeight: 1.5 }}>
        How an article&#39;s link card will look when shared. The card is built from the article&#39;s SEO
        title and share image (own share image first, then the hero image), so if the preview looks
        thin, fix those fields on the article and publish.
      </p>

      {loading ? (
        <p style={{ fontSize: 13, opacity: 0.7 }}>Loading articles…</p>
      ) : posts.length === 0 ? (
        <p style={{ fontSize: 13, opacity: 0.7 }}>No published articles yet. Publish a News article first (Content → News article).</p>
      ) : (
        <>
          <div style={S.row}>
            <label style={{ fontSize: 13, opacity: 0.75 }}>Article:</label>
            <select style={S.select} value={id} onChange={(e) => setId(e.target.value)}>
              {posts.map((p) => (
                <option key={p._id} value={p._id}>{p.title || p.slug?.current}</option>
              ))}
            </select>
          </div>
          <div style={S.row}>
            {PLATFORMS.map((p) => (
              <button key={p} style={S.pill(platform === p)} onClick={() => setPlatform(p)}>{p}</button>
            ))}
          </div>

          <div style={S.stage}>{card()}</div>

          <div style={{ ...S.row, marginTop: 16 }}>
            {platform !== 'Instagram' && (
              <a style={S.btn} href={shareHref(platform, url, title)} target="_blank" rel="noopener noreferrer">
                Share on {platform}
              </a>
            )}
            <button style={S.ghost} onClick={copy}>{copied ? 'Copied ✓' : 'Copy link'}</button>
            <a style={{ fontSize: 13 }} href={url} target="_blank" rel="noopener noreferrer">{url}</a>
          </div>

          <p style={S.note}>
            Approximate previews: platforms tweak their cards constantly, and they cache them. If you
            change the share image after posting, LinkedIn&#39;s Post Inspector (linkedin.com/post-inspector)
            and Facebook&#39;s Sharing Debugger can refresh the cache. Visitors also get share buttons at
            the bottom of every article.
          </p>
        </>
      )}
    </div>
  );
}
