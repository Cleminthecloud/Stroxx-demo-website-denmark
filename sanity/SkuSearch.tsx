'use client';

import { useMemo, useRef, useState, type CSSProperties, type ChangeEvent } from 'react';
import { SKU_OPTIONS, skuMatches } from './lib/skuOptions';

/** Shared searchable product dropdown for the Studio SKU pickers (SkuInput +
 *  SkuListInput). Plain elements + inline styles, matching EncryptedSecretField
 *  (this Studio ships no @sanity/ui). Type a product name or item number, pick
 *  from the list; the parent decides what to do with the chosen code. */

const inputStyle: CSSProperties = {
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
const item: CSSProperties = {
  display: 'block',
  width: '100%',
  textAlign: 'left',
  padding: '8px 12px',
  background: 'transparent',
  border: 'none',
  borderBottom: '1px solid rgba(128,128,128,0.15)',
  color: 'inherit',
  cursor: 'pointer',
  fontSize: 13,
};

export function ProductSearch({
  exclude = [],
  placeholder,
  onPick,
}: {
  exclude?: string[];
  placeholder: string;
  onPick: (code: string) => void;
}) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const results = useMemo(() => {
    const ex = new Set(exclude);
    return SKU_OPTIONS.filter((o) => !ex.has(o.value) && skuMatches(query, o)).slice(0, 30);
  }, [query, exclude]);

  return (
    <div style={{ position: 'relative' }}>
      <input
        style={inputStyle}
        value={query}
        placeholder={placeholder}
        onFocus={() => setOpen(true)}
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          setQuery(e.currentTarget.value);
          setOpen(true);
        }}
        onBlur={() => {
          blurTimer.current = setTimeout(() => setOpen(false), 120);
        }}
      />
      {open && (results.length > 0 || query) && (
        <div style={menu}>
          {results.map((o) => (
            <button
              key={o.value}
              type="button"
              style={item}
              onMouseDown={(e) => {
                e.preventDefault(); // keep focus so the pick registers before blur
                if (blurTimer.current) clearTimeout(blurTimer.current);
                onPick(o.value);
                setQuery('');
                setOpen(false);
              }}
            >
              <div style={{ fontWeight: 500 }}>{o.name}</div>
              <div style={{ opacity: 0.6, fontSize: 12 }}>
                {o.value} · {o.category} · {o.price} kr
              </div>
            </button>
          ))}
          {results.length === 0 && query && (
            <div style={{ ...item, cursor: 'default', opacity: 0.7 }}>No products match “{query}”.</div>
          )}
        </div>
      )}
    </div>
  );
}
