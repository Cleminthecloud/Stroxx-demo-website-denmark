import React from 'react';

/** The editor guide as a Studio tab: iframes the site's /guide page, which
 *  renders docs/STROXX-editor-guide.md, so editors always read the current
 *  version without leaving the Studio. */
export default function GuideTool() {
  return (
    <iframe
      src="/guide"
      title="Editor guide"
      style={{ width: '100%', height: '100%', border: 0, display: 'block' }}
    />
  );
}
