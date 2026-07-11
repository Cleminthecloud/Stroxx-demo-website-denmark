'use client';

import { useMemo, useState } from 'react';
import Reveal from '@/components/Reveal';
import NewsCard, { type NewsCardData } from '@/components/NewsCard';

/** News index explorer, the /products pattern applied to articles: a sticky
 *  row of tag chips (built from whatever tags editors put on their articles,
 *  nothing to configure) filtering a grid of glass cards. */

export default function NewsExplorer({ posts }: { posts: NewsCardData[] }) {
  const [active, setActive] = useState<string | null>(null);

  /* the chip row is exactly the tags in use, most-used first */
  const tags = useMemo(() => {
    const count = new Map<string, number>();
    for (const p of posts) for (const t of p.tags ?? []) count.set(t, (count.get(t) ?? 0) + 1);
    return [...count.entries()].sort((a, b) => b[1] - a[1]).map(([t]) => t);
  }, [posts]);

  const shown = active ? posts.filter((p) => p.tags?.includes(active)) : posts;

  const chip = (on: boolean) =>
    `press shrink-0 text-sm px-3.5 py-1.5 rounded-full border whitespace-nowrap cursor-pointer ${
      on ? 'bg-stroxx-blue border-stroxx-blue text-white' : 'border-line text-fog hover:text-white hover:border-white/25'
    }`;

  return (
    <>
      {tags.length > 0 && (
        <div className="sticky top-14 z-30 -mx-6 md:-mx-10 px-6 md:px-10 pt-4 pb-3 bg-ink/95 backdrop-blur-md border-b border-line mb-10">
          {/* phones: chips scroll edge-to-edge like on /products; lg+: wrap */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar -mx-6 px-6 md:-mx-10 md:px-10 lg:mx-0 lg:px-0 lg:flex-wrap lg:overflow-visible">
            <button onClick={() => setActive(null)} className={chip(!active)}>All</button>
            {tags.map((t) => (
              <button key={t} onClick={() => setActive(active === t ? null : t)} className={chip(active === t)}>
                {t}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 items-stretch">
        {shown.map((p, i) => (
          <Reveal key={p.slug} delay={Math.min(i, 5) * 60} className="h-full">
            <NewsCard post={p} />
          </Reveal>
        ))}
      </div>
      {shown.length === 0 && (
        <p className="text-fog text-lg leading-relaxed py-10">Nothing under that tag yet.</p>
      )}
    </>
  );
}
