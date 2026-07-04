/** `*word*` → blue accent, newline → <br/>. The site's signature text code,
 *  same syntax ScrollText parses. Pure and dependency-free so BOTH server
 *  and client components can render CMS copy with accents. */
export default function Accent({ text }: { text?: string }) {
  if (!text) return null;
  const parts = text.split(/(\*[^*]+\*|\n)/g).filter(Boolean);
  return (
    <>
      {parts.map((p, i) =>
        p === '\n' ? (
          <br key={i} />
        ) : p.length > 2 && p.startsWith('*') && p.endsWith('*') ? (
          <span key={i} className="text-stroxx-blue">
            {p.slice(1, -1)}
          </span>
        ) : (
          <span key={i}>{p}</span>
        )
      )}
    </>
  );
}
