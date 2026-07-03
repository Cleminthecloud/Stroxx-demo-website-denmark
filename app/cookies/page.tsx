import type { Metadata } from 'next';
import LegalBody from '@/components/LegalBody';

export const metadata: Metadata = {
  title: 'Cookie policy',
  description: 'Which cookies this site uses and how to control them.',
  alternates: { canonical: '/cookies' },
};

export default function Page() {
  return <LegalBody slug="cookies" fallbackTitle="Cookie policy" />;
}
