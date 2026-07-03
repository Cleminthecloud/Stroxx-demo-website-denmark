import type { Metadata } from 'next';
import LegalBody from '@/components/LegalBody';

export const metadata: Metadata = {
  title: 'Terms of sale',
  description: 'The terms that apply to purchases of STROXX products at Carl Ras.',
  alternates: { canonical: '/handelsbetingelser' },
};

export default function Page() {
  return <LegalBody slug="handelsbetingelser" fallbackTitle="Terms of sale" />;
}
