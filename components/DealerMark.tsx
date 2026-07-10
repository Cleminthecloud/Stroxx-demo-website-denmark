import type { CSSProperties } from 'react';

/** A dealer logo rendered as a single-ink mask so it takes `currentColor`.
 *  Give it the logo src + aspect ratio and a pixel height; the width follows
 *  the aspect ratio, so every mark lines up at the same height. Set the colour
 *  on a parent via text-* (currentColor drives the fill). */
export default function DealerMark({
  src,
  ar,
  label,
  height = 24,
  className = '',
}: {
  src: string;
  ar: string;
  label?: string;
  height?: number;
  className?: string;
}) {
  const style: CSSProperties = {
    display: 'block',
    height,
    aspectRatio: ar,
    backgroundColor: 'currentColor',
    WebkitMaskImage: `url(${src})`,
    maskImage: `url(${src})`,
    WebkitMaskRepeat: 'no-repeat',
    maskRepeat: 'no-repeat',
    WebkitMaskPosition: 'center',
    maskPosition: 'center',
    WebkitMaskSize: '100% 100%',
    maskSize: '100% 100%',
  };
  return <span role="img" aria-label={label} className={className} style={style} />;
}
