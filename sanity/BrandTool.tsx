import React from 'react';

/** The brand guide as a Studio tab: iframes the site's /brand page (animated
 *  brand marks, downloadable swatches/tokens, the palette + rules, and the
 *  CMS-editable long-form guide Clem grows over the summer). */
export default function BrandTool() {
  return (
    <iframe
      src="/brand"
      title="Brand guide"
      style={{ width: '100%', height: '100%', border: 0, display: 'block' }}
    />
  );
}
