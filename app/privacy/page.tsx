import type { Metadata } from 'next';
import LegalBody from '@/components/LegalBody';

export const metadata: Metadata = {
  title: 'Privacy policy',
  description: 'How STROXX handles personal data on this site.',
  alternates: { canonical: '/privacy' },
};

export default function Page() {
  return <LegalBody slug="privacy" fallbackTitle="Privacy policy" />;
}
