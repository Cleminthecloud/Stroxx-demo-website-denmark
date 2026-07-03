import type { Metadata } from 'next';
import LegalBody from '@/components/LegalBody';

export const metadata: Metadata = {
  title: 'Privacy policy',
  description: 'How STROXX and Carl Ras handle personal data on this site.',
  alternates: { canonical: '/privatliv' },
};

export default function Page() {
  return <LegalBody slug="privatliv" fallbackTitle="Privacy policy" />;
}
