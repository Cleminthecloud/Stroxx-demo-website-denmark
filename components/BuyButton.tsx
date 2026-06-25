import { ArrowRight } from 'lucide-react';
import GlassButton from '@/components/GlassButton';

/** Primary buy CTA, Apple-glass with blue light, animated edge + cursor glow. */
export default function BuyButton({
  href,
  children = 'Buy at Carl Ras',
  className = '',
}: {
  href: string;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <GlassButton href={href} external className={`text-[13px] ${className}`}>
      <span>{children}</span>
      <ArrowRight size={16} strokeWidth={2} className="shrink-0" />
    </GlassButton>
  );
}
