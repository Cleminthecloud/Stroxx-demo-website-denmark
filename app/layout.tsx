import type { Metadata } from 'next';
import './globals.css';
import SmoothScroll from '@/components/SmoothScroll';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import SpecialistFab from '@/components/SpecialistFab';

export const metadata: Metadata = {
  title: 'STROXX — Dyrt værktøj til udyr pris',
  description:
    'STROXX er fuldstændigt ligesom alt dit dyre værktøj og gode gear. Det koster bare ikke nær så meget. Value for money, som man siger på godt dansk.',
  openGraph: {
    title: 'STROXX — Dyrt værktøj til udyr pris',
    description: 'Fedt værktøj til temmelig tynde priser. Kun hos Carl Ras.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="da">
      <body>
        <SmoothScroll>
          <Nav />
          {children}
          <Footer />
          <SpecialistFab />
        </SmoothScroll>
      </body>
    </html>
  );
}
