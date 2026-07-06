/** Partner/retailer logo band on the site's marquee rails. Items with an
 *  image render the logo (grayscaled into the B&W world); items without one
 *  render the name as a typographic wordmark, so the band works day one
 *  before any logo files exist. Server component, CSS animation only. */

export type MarqueeLogo = { name: string; img?: string; href?: string };

function Item({ l }: { l: MarqueeLogo }) {
  const inner = l.img ? (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img src={l.img} alt={l.name} loading="lazy" className="h-8 w-auto opacity-70 grayscale md:h-10" />
  ) : (
    <span className="font-display text-2xl font-medium tracking-tightest text-fog/80 md:text-4xl">{l.name}</span>
  );
  return l.href ? (
    <a href={l.href} target="_blank" rel="noopener noreferrer" className="transition-opacity hover:opacity-100">
      {inner}
    </a>
  ) : (
    inner
  );
}

export default function LogoMarquee({ logos }: { logos: MarqueeLogo[] }) {
  if (!logos.length) return null;
  const Row = () => (
    <div className="marquee__track items-center">
      {logos.map((l, i) => (
        <span key={i} className="flex items-center gap-10">
          <Item l={l} />
          <span className="h-1.5 w-1.5 rounded-full bg-stroxx-blue/60" />
        </span>
      ))}
    </div>
  );
  return (
    <div className="marquee py-8">
      <Row />
      <Row />
    </div>
  );
}
