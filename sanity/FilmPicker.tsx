'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type ChangeEvent } from 'react';
import { set, unset, useClient, type ArrayOfObjectsInputProps } from 'sanity';

/** Two-way film picker for a reference-array field (e.g. the landing-page film
 *  section). Editors pick existing films from the Film (YouTube) collection by
 *  a searchable list, OR paste a YouTube URL: if that film isn't in the list
 *  yet the picker CREATES it in the Film collection and links it, so it's then
 *  reusable everywhere. Stores references, so editing a film once updates every
 *  placement. Plain elements + inline styles (this Studio ships no @sanity/ui).
 *
 *  The reference target and the render join (dereferenced in lib/cms.ts
 *  getLandingPage, mapped in components/cms/LandingSections videoProof) must
 *  stay in step with this component (see DEPENDENCIES.md). */

type Film = { _id: string; title?: string; by?: string; youtubeId?: string };
type Ref = { _key: string; _ref: string; _type: 'reference' };

const API_VERSION = '2024-11-01';
const thumb = (id: string) => `https://i.ytimg.com/vi/${id}/mqdefault.jpg`;
const newKey = () => Math.random().toString(36).slice(2, 12);

/** Pull an 11-char YouTube id out of a URL, embed, share link or bare id. */
function parseYouTubeId(input: string): string | null {
  const s = input.trim();
  if (/^[\w-]{11}$/.test(s)) return s;
  const m = s.match(/(?:youtu\.be\/|[?&]v=|\/embed\/|\/shorts\/|\/live\/)([\w-]{11})/);
  return m ? m[1] : null;
}

const box: CSSProperties = {
  width: '100%',
  padding: '9px 12px',
  borderRadius: 6,
  border: '1px solid rgba(128,128,128,0.35)',
  background: 'transparent',
  color: 'inherit',
  fontSize: 13,
};
const menu: CSSProperties = {
  position: 'absolute',
  zIndex: 30,
  top: 'calc(100% + 4px)',
  left: 0,
  right: 0,
  maxHeight: 300,
  overflowY: 'auto',
  background: '#1b1d22',
  border: '1px solid rgba(128,128,128,0.35)',
  borderRadius: 8,
  boxShadow: '0 10px 28px rgba(0,0,0,0.45)',
};
const opt: CSSProperties = {
  display: 'flex',
  gap: 10,
  alignItems: 'center',
  width: '100%',
  textAlign: 'left',
  padding: '7px 10px',
  background: 'transparent',
  border: 'none',
  borderBottom: '1px solid rgba(128,128,128,0.15)',
  color: 'inherit',
  cursor: 'pointer',
  fontSize: 13,
};
const row: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  padding: '6px 8px',
  borderRadius: 6,
  border: '1px solid rgba(128,128,128,0.3)',
  fontSize: 13,
};
const iconBtn = (tone?: 'critical'): CSSProperties => ({
  border: '1px solid rgba(128,128,128,0.3)',
  background: 'transparent',
  color: tone === 'critical' ? 'rgba(239,120,120,1)' : 'inherit',
  borderRadius: 6,
  padding: '2px 8px',
  fontSize: 13,
  cursor: 'pointer',
});
const addBtn: CSSProperties = {
  border: '1px solid rgba(128,128,128,0.35)',
  background: '#0088C2',
  color: '#fff',
  borderRadius: 999,
  padding: '8px 16px',
  fontSize: 12,
  cursor: 'pointer',
  whiteSpace: 'nowrap',
};

export default function FilmPicker(props: ArrayOfObjectsInputProps) {
  const client = useClient({ apiVersion: API_VERSION });
  const value = useMemo<Ref[]>(() => (props.value as Ref[] | undefined) ?? [], [props.value]);

  const [films, setFilms] = useState<Film[]>([]);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(async () => {
    try {
      const docs = await client.fetch<Film[]>(
        '*[_type == "video"]{_id, title, by, youtubeId} | order(featured desc, _createdAt asc)'
      );
      setFilms(docs);
    } catch {
      /* leave what we have */
    }
  }, [client]);

  useEffect(() => {
    load();
  }, [load]);

  const byId = useMemo(() => new Map(films.map((f) => [f._id, f])), [films]);
  const selectedIds = useMemo(() => new Set(value.map((r) => r._ref)), [value]);

  const commit = (next: Ref[]) => props.onChange(next.length ? set(next) : unset());
  const addRef = (id: string) => {
    if (!selectedIds.has(id)) commit([...value, { _key: newKey(), _ref: id, _type: 'reference' }]);
  };
  const remove = (k: string) => commit(value.filter((r) => r._key !== k));
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= value.length) return;
    const next = value.slice();
    [next[i], next[j]] = [next[j], next[i]];
    commit(next);
  };

  const results = useMemo(() => {
    const q = query.toLowerCase().trim();
    return films
      .filter((f) => !selectedIds.has(f._id))
      .filter((f) => !q || (f.title || '').toLowerCase().includes(q) || (f.by || '').toLowerCase().includes(q) || (f.youtubeId || '').toLowerCase().includes(q))
      .slice(0, 40);
  }, [films, query, selectedIds]);

  async function addByUrl() {
    const id = parseYouTubeId(url);
    if (!id) {
      setErr('Could not read a YouTube link or ID from that. Paste a youtube.com or youtu.be link.');
      return;
    }
    setBusy(true);
    setErr(null);
    try {
      const existing =
        films.find((f) => f.youtubeId === id) ||
        (await client.fetch<Film | null>('*[_type == "video" && youtubeId == $id][0]{_id, title, by, youtubeId}', { id }));
      let docId = existing?._id;
      if (!docId) {
        // Pull the real title + channel from YouTube (via our server route, so
        // no "untitled" film) — blanks are fine if the lookup fails.
        let title = '';
        let by = '';
        try {
          const meta = await fetch(`/api/film-meta?id=${id}`).then((res) => (res.ok ? res.json() : null));
          if (meta) {
            title = typeof meta.title === 'string' ? meta.title : '';
            by = typeof meta.author === 'string' ? meta.author : '';
          }
        } catch {
          /* offline / blocked: create with blanks, editor can rename */
        }
        const created = await client.create({ _type: 'video', youtubeId: id, title, by, active: true });
        docId = created._id;
      }
      await load();
      addRef(docId);
      setUrl('');
    } catch {
      setErr('Could not add that film. Try again, or add it in the Film collection.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      {value.length > 0 && (
        <div style={{ display: 'grid', gap: 6 }}>
          {value.map((r, i) => {
            const f = byId.get(r._ref);
            const yt = f?.youtubeId;
            return (
              <div key={r._key} style={row}>
                {yt ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={thumb(yt)} alt="" width={64} height={36} style={{ borderRadius: 4, objectFit: 'cover', flexShrink: 0 }} />
                ) : (
                  <span style={{ width: 64, height: 36, borderRadius: 4, background: 'rgba(128,128,128,0.25)', flexShrink: 0 }} />
                )}
                <span style={{ flex: 1 }}>
                  <strong>{f?.title || '(untitled film)'}</strong>
                  <span style={{ opacity: 0.6 }}>
                    {'  '}
                    {f?.by ? `${f.by} · ` : ''}
                    {yt || (f ? '' : 'loading…')}
                  </span>
                </span>
                <button type="button" style={iconBtn()} disabled={i === 0} onClick={() => move(i, -1)} title="Move up">↑</button>
                <button type="button" style={iconBtn()} disabled={i === value.length - 1} onClick={() => move(i, 1)} title="Move down">↓</button>
                <button type="button" style={iconBtn('critical')} onClick={() => remove(r._key)} title="Remove">✕</button>
              </div>
            );
          })}
        </div>
      )}

      {/* Pick an existing film */}
      <div style={{ position: 'relative' }}>
        <input
          style={box}
          value={query}
          placeholder="Pick a film from the collection…"
          onFocus={() => setOpen(true)}
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            setQuery(e.currentTarget.value);
            setOpen(true);
          }}
          onBlur={() => {
            blurTimer.current = setTimeout(() => setOpen(false), 120);
          }}
        />
        {open && results.length > 0 && (
          <div style={menu}>
            {results.map((f) => (
              <button
                key={f._id}
                type="button"
                style={opt}
                onMouseDown={(e) => {
                  e.preventDefault();
                  if (blurTimer.current) clearTimeout(blurTimer.current);
                  addRef(f._id);
                  setQuery('');
                  setOpen(false);
                }}
              >
                {f.youtubeId ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={thumb(f.youtubeId)} alt="" width={56} height={32} style={{ borderRadius: 4, objectFit: 'cover' }} />
                ) : null}
                <span>
                  <span style={{ fontWeight: 500 }}>{f.title || '(untitled film)'}</span>
                  {f.by ? <span style={{ opacity: 0.6 }}> · {f.by}</span> : null}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Add a new one by URL */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <input
          style={box}
          value={url}
          placeholder="…or paste a YouTube link to add a new film"
          onChange={(e: ChangeEvent<HTMLInputElement>) => setUrl(e.currentTarget.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addByUrl();
            }
          }}
        />
        <button type="button" style={addBtn} disabled={busy || !url.trim()} onClick={addByUrl}>
          {busy ? 'Adding…' : 'Add film'}
        </button>
      </div>
      <div style={{ fontSize: 12, opacity: 0.7 }}>
        {err
          ? err
          : 'Pasting a link that isn’t in the collection creates the film for you (title and channel pulled from YouTube) and links it here.'}
      </div>
    </div>
  );
}
