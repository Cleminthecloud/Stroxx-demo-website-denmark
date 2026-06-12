import type { Metadata } from 'next';
import EmailPreviews from '@/components/EmailPreviews';

// Hidden internal page: not linked from Nav/Footer and excluded from indexing.
export const metadata: Metadata = {
  title: 'E-mail skabeloner (intern)',
  robots: { index: false, follow: false },
};

export default function EmailSkabelonerPage() {
  return (
    <main className="bg-ink min-h-[100dvh]">
      <EmailPreviews />
    </main>
  );
}
