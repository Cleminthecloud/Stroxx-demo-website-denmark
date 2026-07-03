'use client';

import { useEffect, useState } from 'react';

/** Small "Exit preview" pill shown when draft mode is on OUTSIDE the Studio's
 *  Presentation iframe (inside it, the Studio owns the chrome). Editors who
 *  opened a preview link in a plain tab use this to get back to published. */
export default function ExitPreview() {
  const [standalone, setStandalone] = useState(false);
  const [path, setPath] = useState('/');

  useEffect(() => {
    try {
      setStandalone(window.self === window.top);
      setPath(window.location.pathname + window.location.search);
    } catch {
      setStandalone(false);
    }
  }, []);

  if (!standalone) return null;
  return (
    <a
      href={`/api/draft-mode/disable?back=${encodeURIComponent(path)}`}
      className="fixed bottom-4 left-4 z-[120] rounded-full border border-stroxx-blue/60 bg-ink/90 px-4 py-2 text-xs font-medium text-white backdrop-blur-md hover:bg-stroxx-blue/20 transition-colors"
    >
      Previewing drafts · Exit
    </a>
  );
}
