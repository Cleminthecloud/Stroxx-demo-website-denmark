'use client';

import { useEffect, useMemo, useState } from 'react';
import { useClient } from 'sanity';
import { SITE_URL } from '../lib/site';
import { assetUrl } from './lib/image';
import { ShareCard, PLATFORMS, shareHref, type Platform } from './ShareCard';

/** "Share preview" Studio tab: pick a published article, pick a platform,
 *  and see (approximately) how the link card will render there, built from
 *  the article's real OG data (SEO title, description, share image cascade
 *  own og → hero). The share button matches the chosen platform. The same
 *  card also renders live at the bottom of every article document
 *  (SharePreviewField), so editors see it while they write. */

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
    return <ShareCard platform={platform} title={title} desc={desc} img={img} url={url} />;
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
