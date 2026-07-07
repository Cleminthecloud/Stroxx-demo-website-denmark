'use client';

import type { CSSProperties } from 'react';
import { set, unset, type ArrayOfPrimitivesInputProps } from 'sanity';
import { ProductSearch } from './SkuSearch';
import { skuByCode } from './lib/skuOptions';

/** Searchable multi-select for an array-of-SKU field (the five winners,
 *  article product sliders + related products, landing-page product grids).
 *  Shows the chosen products as a reorderable list (order matters, e.g. the
 *  first related products surface under an article) with an add box that
 *  searches the catalogue. Stores plain item numbers, so unknown/hand-entered
 *  codes still render and are never dropped. Plain elements + inline styles to
 *  match the other Studio inputs (no @sanity/ui). */

const row: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  padding: '8px 10px',
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
  lineHeight: 1.2,
  cursor: 'pointer',
});

export default function SkuListInput(props: ArrayOfPrimitivesInputProps) {
  const value = (props.value as string[] | undefined) ?? [];

  const commit = (next: string[]) => props.onChange(next.length ? set(next) : unset());
  const add = (code: string) => {
    if (!value.includes(code)) commit([...value, code]);
  };
  const remove = (code: string) => commit(value.filter((c) => c !== code));
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= value.length) return;
    const next = value.slice();
    [next[i], next[j]] = [next[j], next[i]];
    commit(next);
  };

  return (
    <div style={{ display: 'grid', gap: 10 }}>
      {value.length > 0 && (
        <div style={{ display: 'grid', gap: 6 }}>
          {value.map((code, i) => {
            const o = skuByCode.get(code);
            return (
              <div key={code} style={row}>
                <span style={{ flex: 1 }}>
                  <strong>{o ? o.name : 'Not in catalogue'}</strong>
                  <span style={{ opacity: 0.6 }}>
                    {'  '}
                    {code}
                    {o ? ` · ${o.category}` : ' · unknown item number, will be skipped on the site'}
                  </span>
                </span>
                <button type="button" style={iconBtn()} disabled={i === 0} onClick={() => move(i, -1)} aria-label="Move up" title="Move up">↑</button>
                <button type="button" style={iconBtn()} disabled={i === value.length - 1} onClick={() => move(i, 1)} aria-label="Move down" title="Move down">↓</button>
                <button type="button" style={iconBtn('critical')} onClick={() => remove(code)} aria-label="Remove" title="Remove">✕</button>
              </div>
            );
          })}
        </div>
      )}

      <ProductSearch exclude={value} placeholder="Add a product by name or item number…" onPick={add} />
    </div>
  );
}
