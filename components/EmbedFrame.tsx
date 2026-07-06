'use client';
import { useState } from 'react';
import { ArrowRight } from 'lucide-react';

/** Third-party embed, the safe kind: iframe-only, host allowlisted in CODE
 *  (never CMS-configurable, that is the security promise in the IT doc),
 *  sandboxed, and click-to-load so nothing external, no cookies, no
 *  requests, happens before the visitor chooses to load it. Script-based
 *  widgets stay banned from the CMS; those go through GTM.
 *
 *  Adding a provider = one line here + a deploy, on purpose. */

const EMBED_ALLOWLIST = [
  'typeform.com',
  'forms.office.com',
  'docs.google.com',
  'google.com', // maps embeds
  'youtube-nocookie.com',
  'youtube.com',
  'player.vimeo.com',
  'carl-ras.dk',
  'stroxx.eu',
];

export function embedHost(url: string): string | null {
  try {
    const h = new URL(url).hostname.toLowerCase();
    const ok = EMBED_ALLOWLIST.some((d) => h === d || h.endsWith(`.${d}`));
    return ok ? h : null;
  } catch {
    return null;
  }
}

export default function EmbedFrame({ url, height = 600, title }: { url: string; height?: number; title?: string }) {
  const [loaded, setLoaded] = useState(false);
  const host = embedHost(url);
  const h = Math.min(Math.max(height || 600, 200), 2000);

  if (!host) {
    /* honest in every environment: editors see WHY nothing renders and what
       to ask for, instead of a silent hole in the page */
    return (
      <div className="rounded-xl border border-line bg-ink/50 p-8 text-center">
        <p className="text-fog text-sm leading-relaxed">
          This embed&apos;s address is not on the approved provider list, so it will not load.
          Ask the developer to approve the provider, or check the address for typos.
        </p>
      </div>
    );
  }

  if (!loaded) {
    return (
      <div className="grid place-items-center rounded-xl border border-line bg-ink/50 p-10 text-center" style={{ minHeight: Math.min(h, 420) }}>
        <div>
          <p className="mb-1 text-white text-lg font-medium">{title || 'External content'}</p>
          <p className="mb-6 text-fog text-sm leading-relaxed">
            Loads from {host}. Nothing is fetched, and no cookies are set, until you choose to load it.
          </p>
          <button
            type="button"
            onClick={() => setLoaded(true)}
            className="glass-cta inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium text-white"
          >
            Load content <ArrowRight size={15} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <iframe
      src={url}
      title={title || `Embedded content from ${host}`}
      loading="lazy"
      sandbox="allow-scripts allow-forms allow-same-origin allow-popups"
      referrerPolicy="strict-origin-when-cross-origin"
      className="w-full rounded-xl border border-line bg-ink/50"
      style={{ height: h }}
    />
  );
}
