'use client';

import { useEffect, useState } from 'react';
import { Share2, Linkedin, Facebook, Mail, MessageCircle, Link as LinkIcon, Check } from 'lucide-react';
import { sendTrack } from '@/lib/track-client';

/** Share row on articles. The primary button opens the device's native share
 *  sheet (Web Share API), so every market shares wherever its people actually
 *  share; the channel buttons are the desktop fallback using the platforms'
 *  standard share URLs. Every tap is counted anonymously per channel, and
 *  the Dashboard shows which channels the STROXX audience really uses.
 *  Link cards on the platforms are built from the page's OG title and share
 *  image. (On the pre-launch domain, platform preview fetchers are blocked by
 *  the site-wide noindex; that resolves itself on the real domain.) */

function xIcon(size: number) {
  /* X's logo isn't in lucide; a simple path keeps it dependency-free */
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export default function ShareRow({ url, title }: { url: string; title?: string }) {
  const [copied, setCopied] = useState(false);
  const [canNative, setCanNative] = useState(false);
  useEffect(() => {
    try {
      setCanNative(typeof navigator !== 'undefined' && !!navigator.share);
    } catch {}
  }, []);

  const track = (channel: string) => sendTrack({ t: 'share', channel });

  const native = async () => {
    try {
      await navigator.share({ title: title || 'STROXX', url });
      track('native');
    } catch {
      /* user closed the sheet: not a share, not an error */
    }
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      track('copy');
      setTimeout(() => setCopied(false), 1600);
    } catch {}
  };

  const u = encodeURIComponent(url);
  const text = encodeURIComponent(title || '');
  const channels: { id: string; label: string; href: string; icon: React.ReactNode }[] = [
    { id: 'linkedin', label: 'LinkedIn', href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}`, icon: <Linkedin size={14} /> },
    { id: 'facebook', label: 'Facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${u}`, icon: <Facebook size={14} /> },
    { id: 'x', label: 'X', href: `https://twitter.com/intent/tweet?url=${u}&text=${text}`, icon: xIcon(13) },
    { id: 'whatsapp', label: 'WhatsApp', href: `https://wa.me/?text=${text}%20${u}`, icon: <MessageCircle size={14} /> },
    { id: 'email', label: 'Email', href: `mailto:?subject=${text}&body=${u}`, icon: <Mail size={14} /> },
  ];

  const pill =
    'inline-flex items-center gap-2 rounded-full bg-white/[0.06] px-4 py-2 text-[13px] text-fog hover:text-white hover:bg-white/[0.1] transition-colors cursor-pointer';

  return (
    <div className="mt-14 flex flex-wrap items-center gap-2.5">
      <span className="text-fog/60 text-xs uppercase tracking-wider mr-1">Share</span>
      {canNative && (
        <button onClick={native} className={`${pill} !bg-stroxx-blue/20 border border-stroxx-blue/50 !text-white hover:!bg-stroxx-blue/30`}>
          <Share2 size={14} /> Share
        </button>
      )}
      {channels.map((c) => (
        <a key={c.id} href={c.href} target="_blank" rel="noopener noreferrer" className={pill} onClick={() => track(c.id)}>
          {c.icon} {c.label}
        </a>
      ))}
      <button onClick={copy} className={pill}>
        {copied ? <Check size={14} className="text-stroxx-blue" /> : <LinkIcon size={14} />}
        {copied ? 'Copied' : 'Copy link'}
      </button>
    </div>
  );
}
