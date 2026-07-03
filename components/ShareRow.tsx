'use client';

import { useState } from 'react';
import { Linkedin, Link as LinkIcon, Check } from 'lucide-react';

/** Share row on news articles: LinkedIn share + copy link. LinkedIn builds
 *  the card from the page's OG title and share image, which the article
 *  already sets, so the link looks right out of the box. */

export default function ShareRow({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {}
  };
  const pill =
    'inline-flex items-center gap-2 rounded-full bg-white/[0.06] px-4 py-2 text-[13px] text-fog hover:text-white hover:bg-white/[0.1] transition-colors';
  return (
    <div className="mt-14 flex flex-wrap items-center gap-3">
      <span className="text-fog/60 text-xs uppercase tracking-wider mr-1">Share</span>
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
        className={pill}
      >
        <Linkedin size={14} /> LinkedIn
      </a>
      <button onClick={copy} className={`${pill} cursor-pointer`}>
        {copied ? <Check size={14} className="text-stroxx-blue" /> : <LinkIcon size={14} />}
        {copied ? 'Copied' : 'Copy link'}
      </button>
    </div>
  );
}
