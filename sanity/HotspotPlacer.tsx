'use client';

import { useRef, useState, type CSSProperties } from 'react';
import { set, useFormValue, type ArrayOfObjectsInputProps } from 'sanity';
import { projectId, dataset } from './env';

/** Visual placer for image hotspots.
 *
 *  Sits above the normal array editor: the editor sees the picture, clicks
 *  where a spot belongs, and drags the marker to nudge it. Position is stored
 *  as x/y percentages of the image box, so the spots stay put at every screen
 *  size and survive the image being re-cropped. Everything else about a spot
 *  (its title, text, product and link) is edited in the ordinary list below,
 *  which this component still renders — nothing is hidden from the editor.
 *
 *  Plain elements + inline styles, matching the other Studio inputs. */

const HELP: CSSProperties = { fontSize: 12, opacity: 0.7, lineHeight: 1.5 };
const box: CSSProperties = {
  position: 'relative',
  borderRadius: 8,
  overflow: 'hidden',
  border: '1px solid rgba(128,128,128,0.3)',
  background: 'rgba(128,128,128,0.08)',
  cursor: 'crosshair',
  userSelect: 'none',
};

type Spot = { _key: string; _type?: string; x?: number; y?: number; title?: string };

/** Preview URL for the sibling image field, without pulling in the image-url
 *  builder's full types: the Studio already knows the asset ref. */
function previewUrl(img: unknown): string | null {
  const ref = (img as { asset?: { _ref?: string } } | null | undefined)?.asset?._ref;
  if (typeof ref !== 'string') return null;
  const m = /^image-([a-f0-9]+)-(\d+x\d+)-(\w+)$/.exec(ref);
  if (!m) return null;
  return `https://cdn.sanity.io/images/${projectId}/${dataset}/${m[1]}-${m[2]}.${m[3]}?w=1200&auto=format`;
}

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n * 10) / 10));
const newKey = () => Math.random().toString(36).slice(2, 10);

export default function HotspotPlacer(props: ArrayOfObjectsInputProps) {
  const spots = ((props.value as Spot[] | undefined) ?? []).filter(Boolean);
  /* the image lives on the same object as this array: ../image (upload) with
     ../imagePath as the /public fallback */
  const upload = useFormValue([...props.path.slice(0, -1), 'imageUpload']);
  const path = useFormValue([...props.path.slice(0, -1), 'image']);
  const src = previewUrl(upload) || (typeof path === 'string' && path.startsWith('/') ? path : null);

  const ref = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<string | null>(null);

  const at = (e: { clientX: number; clientY: number }) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r || !r.width || !r.height) return null;
    return { x: clamp(((e.clientX - r.left) / r.width) * 100), y: clamp(((e.clientY - r.top) / r.height) * 100) };
  };

  const addAt = (e: React.MouseEvent) => {
    if (dragging) return;
    const p = at(e);
    if (!p) return;
    props.onChange(set([...spots, { _key: newKey(), _type: 'hotspot', x: p.x, y: p.y, title: `Spot ${spots.length + 1}` }]));
  };

  const moveTo = (key: string, e: React.MouseEvent) => {
    const p = at(e);
    if (!p) return;
    props.onChange(set(spots.map((s) => (s._key === key ? { ...s, x: p.x, y: p.y } : s))));
  };

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      {src ? (
        <>
          <div style={HELP}>
            Click the picture to drop a spot, drag a marker to move it. Write what each spot says in the list underneath.
          </div>
          <div
            ref={ref}
            style={box}
            onClick={addAt}
            onMouseMove={(e) => dragging && moveTo(dragging, e)}
            onMouseUp={() => setDragging(null)}
            onMouseLeave={() => setDragging(null)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="" draggable={false} style={{ display: 'block', width: '100%', height: 'auto' }} />
            {spots.map((s, i) => (
              <button
                key={s._key}
                type="button"
                title={s.title || `Spot ${i + 1}`}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  setDragging(s._key);
                }}
                onClick={(e) => e.stopPropagation()}
                style={{
                  position: 'absolute',
                  left: `${s.x ?? 50}%`,
                  top: `${s.y ?? 50}%`,
                  transform: 'translate(-50%, -50%)',
                  width: 26,
                  height: 26,
                  borderRadius: '50%',
                  border: '2px solid #fff',
                  background: '#0088C2',
                  color: '#fff',
                  fontSize: 12,
                  fontWeight: 700,
                  lineHeight: 1,
                  cursor: 'grab',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.45)',
                }}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </>
      ) : (
        <div style={HELP}>Upload the picture first, then click it here to place the spots.</div>
      )}
      {props.renderDefault(props)}
    </div>
  );
}
