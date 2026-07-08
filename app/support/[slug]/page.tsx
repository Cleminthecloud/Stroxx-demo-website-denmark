import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Download } from 'lucide-react';
import { getSupportPage } from '@/lib/cms';
import { stegaClean } from '@sanity/client/stega';

/** One support page: manuals/guides grouped by language, each item a direct
 *  file download served from the CMS. The packaging QR codes in circulation
 *  resolve here (middleware forwards the old /pages/<slug> addresses), so
 *  this page must work perfectly on a phone in a workshop: big touch
 *  targets, no fluff, downloads one tap away. */

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const doc = await getSupportPage((await params).slug);
  if (!doc) return { title: 'STROXX' };
  return {
    title: stegaClean(doc.seoTitle) || `${stegaClean(doc.title)} · Support`,
    description: stegaClean(doc.seoDescription) || stegaClean(doc.intro) || undefined,
    alternates: { canonical: `/support/${(await params).slug}` },
  };
}

function fmtSize(bytes?: number) {
  if (!bytes || bytes <= 0) return null;
  const mb = bytes / 1048576;
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

export default async function SupportPage({ params }: { params: Promise<{ slug: string }> }) {
  const doc = await getSupportPage((await params).slug);
  if (!doc) notFound();

  return (
    <main className="bg-ink min-h-screen">
      <div className="mx-auto max-w-[1600px] px-6 md:px-10 pt-36 pb-28">
        <Link href="/support" className="link-arrow text-sm mb-8 inline-flex">
          <ArrowLeft size={15} /> All support pages
        </Link>
        <div className="eyebrow mb-6 mt-6">Support</div>
        <h1 className="h-display text-white text-[clamp(2.4rem,5.5vw,4.5rem)] leading-[0.92] mb-6">{doc.title}</h1>
        {doc.intro && <p className="text-fog text-lg max-w-xl leading-relaxed mb-12">{doc.intro}</p>}

        <div className="grid gap-4 md:grid-cols-2 max-w-5xl">
          {(doc.groups ?? []).map((g, gi) => (
            <section key={gi} className="glass-panel rounded-xl p-7">
              <h2 className="text-white font-display font-bold text-xl mb-5">{g.heading}</h2>
              <ul className="space-y-1">
                {(g.items ?? []).map((it, ii) => {
                  const size = fmtSize(it.size);
                  const meta = [it.ext?.toUpperCase(), size].filter(Boolean).join(' · ');
                  return (
                    <li key={ii}>
                      {it.videoUrl ? (
                        <figure className="py-2">
                          <figcaption className="text-white text-[15px] leading-snug mb-2">
                            {it.label}
                            {it.note ? <span className="text-fog/70 text-xs"> · {it.note}</span> : null}
                          </figcaption>
                          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                          <video
                            controls
                            preload="metadata"
                            playsInline
                            className="w-full rounded-lg border border-white/10 bg-black"
                          >
                            <source src={it.videoUrl} type={it.videoMime || 'video/mp4'} />
                          </video>
                          <a
                            href={`${it.videoUrl}?dl=`}
                            className="mt-2 inline-flex items-center gap-1.5 text-stroxx-blue text-xs hover:text-[#2FACE8]"
                          >
                            <Download size={13} className="shrink-0" />
                            Download{fmtSize(it.videoSize) ? ` · ${fmtSize(it.videoSize)}` : ''}
                          </a>
                        </figure>
                      ) : it.url ? (
                        <a
                          href={`${it.url}?dl=`}
                          className="group flex items-center gap-3.5 rounded-lg px-3 py-3 -mx-3 hover:bg-white/[0.04] transition-colors"
                        >
                          <Download size={18} className="text-stroxx-blue shrink-0" />
                          <span className="min-w-0">
                            <span className="block text-stroxx-blue text-[15px] leading-snug group-hover:text-[#2FACE8]">
                              {it.label}
                            </span>
                            <span className="block text-fog/70 text-xs mt-0.5">
                              {[it.note, meta].filter(Boolean).join(' · ')}
                            </span>
                          </span>
                        </a>
                      ) : (
                        <span className="flex items-center gap-3.5 px-3 py-3 -mx-3 opacity-60">
                          <Download size={18} className="text-fog shrink-0" />
                          <span className="min-w-0">
                            <span className="block text-fog text-[15px] leading-snug">{it.label}</span>
                            <span className="block text-fog/70 text-xs mt-0.5">
                              {[it.note, 'file on its way'].filter(Boolean).join(' · ')}
                            </span>
                          </span>
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>

        <p className="text-fog/70 text-sm max-w-xl leading-relaxed mt-12">
          Missing a document or a language? Ask the specialists via the chat, or find your local dealer under{' '}
          <Link href="/butikker" className="text-stroxx-blue">stores</Link>.
        </p>
      </div>
    </main>
  );
}
