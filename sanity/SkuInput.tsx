'use client';

import type { CSSProperties } from 'react';
import { set, unset, type StringInputProps } from 'sanity';
import { ProductSearch } from './SkuSearch';
import { skuByCode } from './lib/skuOptions';

/** Searchable product picker for a single-SKU string field (hero SKU, a news
 *  item's SKU, a testimonial's product, a product augment). Search by product
 *  name OR item number; the stored value is always the item number. Backed by
 *  the shared catalogue (sanity/lib/skuOptions). A value not in the catalogue
 *  still shows, so hand-entered codes are never lost. Plain elements + inline
 *  styles to match the other Studio inputs (no @sanity/ui). */

const chip: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  padding: '8px 12px',
  borderRadius: 6,
  border: '1px solid rgba(128,128,128,0.35)',
  fontSize: 13,
};
const changeBtn: CSSProperties = {
  border: '1px solid rgba(128,128,128,0.35)',
  background: 'transparent',
  color: 'inherit',
  borderRadius: 999,
  padding: '4px 12px',
  fontSize: 12,
  cursor: 'pointer',
};

export default function SkuInput(props: StringInputProps) {
  const { value, onChange } = props;

  if (value) {
    const o = skuByCode.get(value);
    return (
      <div style={chip}>
        <span style={{ flex: 1 }}>
          <strong>{o ? o.name : 'Not in catalogue'}</strong>
          <span style={{ opacity: 0.6 }}>
            {'  '}
            {value}
            {o ? ` · ${o.category}` : ' · unknown item number, will be skipped on the site'}
          </span>
        </span>
        <button type="button" style={changeBtn} onClick={() => onChange(unset())}>
          Change
        </button>
      </div>
    );
  }

  return (
    <ProductSearch
      placeholder="Search by product name or item number…"
      onPick={(code) => onChange(set(code))}
    />
  );
}
