import type { Metadata } from 'next';

// /plan is a hidden internal page (reachable via Cmd+K); keep it out of search.
export const metadata: Metadata = {
  title: 'Projektplan (intern) — STROXX',
  robots: { index: false, follow: false },
};

export default function PlanLayout({ children }: { children: React.ReactNode }) {
  return children;
}
