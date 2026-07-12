import type { Metadata } from 'next';
import LegalBody from '@/components/LegalBody';

export const metadata: Metadata = {
  title: 'Terms of sale',
  description: 'Purchases of STROXX products happen at your STROXX dealer, and the dealer\u2019s terms of sale and delivery apply.',
  alternates: { canonical: '/terms' },
};

export default function Page() {
  return <LegalBody slug="terms" fallbackTitle="Terms of sale" />;
}
