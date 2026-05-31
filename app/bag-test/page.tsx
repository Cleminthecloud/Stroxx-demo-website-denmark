import BagFill from '@/components/BagFill';

export const metadata = { title: 'Bag fill — test', robots: { index: false } };

export default function BagTestPage() {
  return (
    <main className="bg-ink min-h-screen">
      <div className="h-[40vh] flex items-end justify-center pb-10">
        <p className="text-fog text-sm">Scroll ned — fyld posen ↓</p>
      </div>
      <BagFill />
      <div className="h-[60vh] flex items-start justify-center pt-20">
        <p className="text-fog text-sm">Slut på test</p>
      </div>
    </main>
  );
}
