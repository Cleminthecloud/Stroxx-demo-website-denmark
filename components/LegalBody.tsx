import { PortableText } from 'next-sanity';
import { getLegalPage } from '@/lib/cms';

/** Shared renderer for the legal pages (privacy, cookies, terms). Content is
 *  a `legalPage` document per page; until legal delivers the text, a clear
 *  placeholder renders so the routes exist and are linkable. */
export default async function LegalBody({ slug, fallbackTitle }: { slug: string; fallbackTitle: string }) {
  const doc = await getLegalPage(slug);
  return (
    <main className="bg-ink min-h-screen">
      <div className="mx-auto max-w-3xl px-6 md:px-10 pt-36 pb-28">
        <div className="eyebrow mb-6">Legal</div>
        <h1 className="h-display text-white text-[clamp(2.2rem,5vw,4rem)] leading-[0.95] mb-10">
          {doc?.title || fallbackTitle}
        </h1>
        {doc?.body ? (
          <div className="text-fog leading-relaxed space-y-5 [&_strong]:text-white [&_h2]:text-white [&_h2]:text-2xl [&_h2]:mt-10 [&_h3]:text-white [&_h3]:text-xl [&_h3]:mt-8 [&_a]:text-stroxx-blue">
            <PortableText value={doc.body} />
          </div>
        ) : (
          <p className="text-fog leading-relaxed">
            This page is being finalized with the legal team and will be published before launch.
          </p>
        )}
      </div>
    </main>
  );
}
