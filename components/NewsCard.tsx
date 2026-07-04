'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import GlassCardGlow from '@/components/GlassCardGlow';
import GlassButton from '@/components/GlassButton';

/** News card in the site's glass design system, the same family as the
 *  product cards: cursor-lit glass, hover lift, image that scales, white
 *  bold headline, tag pills, and the glass CTA. */

export type NewsCardData = {
  slug: string;
  title: string;
  excerpt?: string;
  date?: string;
  img?: string | null;
  alt?: string;
  tags?: string[];
};

export default function NewsCard({ post }: { post: NewsCardData }) {
  const href = `/nyheder/${post.slug}`;
  return (
    <div className="relative group h-full">
      <GlassCardGlow className="relative h-full flex flex-col glass glass-card rounded-xl overflow-hidden transition-transform duration-500 group-hover:-translate-y-1">
        {/* hero image, scales on hover like the product cut-outs */}
        <Link href={href} className="relative block aspect-[16/10] overflow-hidden">
          <div className="absolute inset-0 z-10 pointer-events-none" style={{ background: 'linear-gradient(180deg, rgba(11,12,14,0) 55%, rgba(11,12,14,0.55) 100%)' }} />
          {post.img ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={post.img} alt={post.alt || ''} loading="lazy" decoding="async"
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.05]" />
          ) : (
            <div className="h-full w-full" style={{ background: 'radial-gradient(80% 80% at 50% 30%, rgba(0,136,194,0.22), rgba(11,12,14,1) 75%)' }} />
          )}
          {post.tags && post.tags.length > 0 && (
            <div className="absolute top-3 left-3 z-20 flex flex-wrap gap-1.5">
              {post.tags.slice(0, 3).map((t) => (
                <span key={t} className="text-[10px] font-semibold uppercase tracking-wide px-2 py-1 rounded-full bg-ink/70 border border-white/15 text-white/85 backdrop-blur-sm">
                  {t}
                </span>
              ))}
            </div>
          )}
        </Link>

        <div className="relative z-10 flex flex-col flex-1 p-5">
          {post.date && <div className="text-[11px] uppercase tracking-wider text-fog mb-2">{post.date}</div>}
          <Link href={href}
            className="font-display font-bold text-white text-xl leading-snug mb-2 line-clamp-2 hover:text-stroxx-blue transition-colors">
            {post.title}
          </Link>
          {post.excerpt && <p className="text-fog text-sm leading-relaxed line-clamp-3 mb-5">{post.excerpt}</p>}
          <div className="mt-auto">
            <GlassButton href={href} size="sm" className="w-full justify-center">
              Read article <ArrowRight size={14} />
            </GlassButton>
          </div>
        </div>
      </GlassCardGlow>
    </div>
  );
}
