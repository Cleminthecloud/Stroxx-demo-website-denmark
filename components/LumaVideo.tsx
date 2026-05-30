'use client';
import { useEffect, useRef } from 'react';

/** Plays a video on a canvas and keys out its (near-black) background per-frame,
 *  giving a true alpha — used for the guarantee sticker film which is shot on black. */
export default function LumaVideo({
  src,
  className = '',
  size = 460,
}: {
  src: string;
  className?: string;
  size?: number;
}) {
  const video = useRef<HTMLVideoElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const v = video.current;
    const c = canvas.current;
    if (!v || !c) return;
    const ctx = c.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    let raf = 0;
    let w = size, h = size;

    const draw = () => {
      if (v.readyState >= 2 && v.videoWidth) {
        if (c.width !== w || c.height !== h) {
          const ar = v.videoWidth / v.videoHeight;
          w = size; h = Math.round(size / ar);
          c.width = w; c.height = h;
        }
        ctx.drawImage(v, 0, 0, w, h);
        try {
          const img = ctx.getImageData(0, 0, w, h);
          const d = img.data;
          for (let i = 0; i < d.length; i += 4) {
            const lum = 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];
            // black bg -> transparent; sticker -> opaque, with a soft edge
            let a = (lum - 16) / 44; // 16..60 ramp
            if (a < 0) a = 0; else if (a > 1) a = 1;
            d[i + 3] = Math.round(a * 255);
          }
          ctx.putImageData(img, 0, 0);
        } catch {
          /* ignore */
        }
      }
      raf = requestAnimationFrame(draw);
    };

    const start = () => { v.play().catch(() => {}); if (!raf) raf = requestAnimationFrame(draw); };
    v.addEventListener('loadeddata', start);
    start();
    return () => {
      cancelAnimationFrame(raf);
      v.removeEventListener('loadeddata', start);
    };
  }, [src, size]);

  return (
    <div className={className}>
      <video ref={video} src={src} muted loop playsInline preload="auto" className="hidden" />
      <canvas ref={canvas} className="w-full h-auto" />
    </div>
  );
}
