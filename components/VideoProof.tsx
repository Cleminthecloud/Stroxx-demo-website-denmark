'use client';
import { useState } from 'react';
import { Play } from 'lucide-react';

/** "Se det i aktion": lite YouTube player (thumbnail until click, then
 *  autoplaying nocookie iframe) + a Se flere strip that swaps the featured
 *  video. Videos are real STROXX films from the partner chains. */

interface Video { id: string; title: string; by: string }

const FEATURED: Video = { id: 'egSu462a-rI', title: 'STROXX Powertools', by: 'Lecot' };
const MORE: Video[] = [
  { id: 'LR4bsAip9bI', title: 'Borehoved, produktvideo', by: 'Meesenburg' },
  { id: 'q5v1MhyKHoQ', title: 'Kniv, teaser', by: 'Meesenburg' },
  { id: 'o4AEU1-H56w', title: 'Trappestige, teaser', by: 'Meesenburg' },
  { id: 'fuaFnPv9rIQ', title: 'Bits, teaser', by: 'Meesenburg' },
  { id: '9nBiA4joKlc', title: 'Slukspray, teaser', by: 'Meesenburg' },
];

const thumb = (id: string) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;

export default function VideoProof() {
  const [current, setCurrent] = useState<Video>(FEATURED);
  const [playing, setPlaying] = useState(false);

  const select = (v: Video) => {
    setCurrent(v);
    setPlaying(true);
  };

  return (
    <div>
      {/* featured player */}
      <div className="glass-card glass-card--on relative rounded-2xl mb-6">
        <div className="isolate relative aspect-video w-full rounded-2xl overflow-hidden border border-white/10 bg-[#101216] shadow-[0_30px_80px_rgba(0,0,0,0.5)]">
          {playing ? (
            <iframe
              key={current.id}
              src={`https://www.youtube-nocookie.com/embed/${current.id}?autoplay=1&rel=0&color=white`}
              title={current.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 h-full w-full"
            />
          ) : (
            <button
              onClick={() => setPlaying(true)}
              aria-label={`Afspil: ${current.title}`}
              className="group absolute inset-0 h-full w-full cursor-pointer"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={thumb(current.id)} alt={current.title} draggable={false}
                className="absolute inset-0 h-full w-full object-cover select-none transition-transform duration-700 group-hover:scale-[1.03]" />
              <div className="absolute inset-0" style={{
                background: 'linear-gradient(180deg, rgba(8,9,11,0.15) 0%, rgba(8,9,11,0.05) 50%, rgba(8,9,11,0.65) 100%)' }} />
              <span className="absolute inset-0 grid place-items-center">
                <span className="grid h-20 w-20 place-items-center rounded-full border border-white/25 text-white transition-all duration-300 group-hover:scale-110"
                  style={{
                    background: 'rgba(0,130,202,0.85)',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.3), 0 14px 40px rgba(0,0,0,0.5), 0 0 40px rgba(0,130,202,0.45)',
                    backdropFilter: 'blur(8px)',
                  }}>
                  <Play size={28} className="ml-1" fill="currentColor" />
                </span>
              </span>
              <span className="absolute bottom-5 left-6 right-6 text-left">
                <span className="block text-white font-medium text-base md:text-lg leading-tight">{current.title}</span>
                <span className="block text-fog text-[12px] mt-1">{current.by}</span>
              </span>
            </button>
          )}
        </div>
      </div>

      {/* se flere */}
      <div className="text-[12px] uppercase tracking-wider text-fog mb-3">Se flere</div>
      <div className="flex gap-3 overflow-x-auto pb-2 lg:grid lg:grid-cols-5 lg:overflow-visible sf-scroll" data-lenis-prevent>
        {MORE.map((v) => {
          const active = v.id === current.id;
          return (
            <button
              key={v.id}
              onClick={() => select(v)}
              aria-label={`Afspil: ${v.title}`}
              className={`group relative shrink-0 w-[58vw] sm:w-64 lg:w-auto rounded-xl overflow-hidden border text-left transition-all duration-300 cursor-pointer ${
                active
                  ? 'border-stroxx-blue/70 shadow-[0_0_26px_rgba(0,130,202,0.3)]'
                  : 'border-white/10 hover:border-white/30'
              }`}
            >
              <span className="relative block aspect-video overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={thumb(v.id)} alt={v.title} loading="lazy" draggable={false}
                  className="absolute inset-0 h-full w-full object-cover select-none transition-transform duration-500 group-hover:scale-[1.06]" />
                <span className="absolute inset-0" style={{
                  background: 'linear-gradient(180deg, rgba(8,9,11,0) 40%, rgba(8,9,11,0.8) 100%)' }} />
                <span className="absolute inset-0 grid place-items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-stroxx-blue/85 text-white border border-white/25">
                    <Play size={15} className="ml-0.5" fill="currentColor" />
                  </span>
                </span>
              </span>
              <span className="block px-3 py-2.5 bg-white/[0.03]">
                <span className="block text-white text-[12px] leading-snug line-clamp-1">{v.title}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
