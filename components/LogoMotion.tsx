'use client';

import { useState } from 'react';
import { RotateCcw } from 'lucide-react';

/** An animated-logo card with a Replay button. Bumping the key + cache-busting
 *  the src remounts the <img>, so the SMIL animation restarts from the top,
 *  whenever you want to watch it. Works for both the reveal and the loop. */
export default function LogoMotion({ src, alt }: { src: string; alt: string }) {
  const [k, setK] = useState(0);
  return (
    <div className="flex flex-col">
      <div
        className="rounded-xl overflow-hidden mb-3"
        style={{
          background: '#0B0C0E',
          border: '1px solid rgba(0,136,194,0.16)',
          boxShadow: 'inset 0 0 60px rgba(0,136,194,0.07), 0 0 40px rgba(0,136,194,0.10)',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img key={k} src={`${src}?v=6&r=${k}`} alt={alt} className="w-full" />
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
