'use client';

import { useState } from 'react';
import { RotateCcw } from 'lucide-react';

/** The animated logo reveal with a Replay button. The reveal SVG (SMIL) plays
 *  once on load; bumping the key + cache-busting the src remounts the <img>, so
 *  it re-plays from the start whenever you want to see it. */
export default function LogoReveal() {
  const [k, setK] = useState(0);
  return (
    <div className="flex flex-col">
      <div className="rounded-xl overflow-hidden mb-3" style={{ background: '#0B0C0E', border: '1px solid rgba(255,255,255,0.06)' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img key={k} src={`/brand/motion/stroxx-logo-reveal.svg?r=${k}`} alt="STROXX logo reveal animation" className="w-full" />
      </div>
      <button
        type="button"
        onClick={() => setK((n) => n + 1)}
        className="self-start inline-flex items-center gap-2 rounded-full border border-line bg-ink/50 px-4 py-1.5 text-xs text-fog transition-colors hover:border-stroxx-blue/50 hover:text-white"
      >
        <RotateCcw size={13} strokeWidth={2} /> Replay
      </button>
    </div>
  );
}
