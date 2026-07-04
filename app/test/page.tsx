import type { Metadata } from 'next';
import Reveal from '@/components/Reveal';
import FeedbackForm from '@/components/FeedbackForm';

export const metadata: Metadata = {
  title: 'Test guide',
  robots: { index: false, follow: false },
};

/** The tester's landing page: what to try, and the report form. Noindex but
 *  publicly reachable (like /guide), so a plain link in a mail or chat is all
 *  an invited tester needs, no account, no login. Reports land as `feedback`
 *  documents in the Studio for triage. */

const JOURNEYS: { title: string; body: string }[] = [
  {
    title: 'Find a tool for your trade',
    body: 'Start at the front page, pick your trade (or browse Products), open a product, and try the buy button. Did you find what you would actually look for, and did anything feel slow or confusing?',
  },
  {
    title: 'Find your nearest store',
    body: 'Open Stores, find the store you would really drive to, check its hours and phone number. Try the Specialists tab too and imagine calling one.',
  },
  {
    title: 'Scan the box',
    body: 'On your PHONE: go to /qr/st2 (that is what the packaging QR codes do). You should land on manuals you can download and read.',
  },
  {
    title: 'Read an article and share it',
    body: 'Open News, read an article on your phone, try the share buttons at the bottom, and check the preview card looks right where you shared it.',
  },
  {
    title: 'Ask the assistant',
    body: 'Open "Talk to a specialist" (bottom right), ask a real question in your own words, e.g. which laser suits a small crew. Was the answer honest and useful, and did the handoff to a human make sense?',
  },
  {
    title: 'The month and the guarantee',
    body: 'Check Tool of the Month and the Try It campaign page. Would the 30-day guarantee actually convince you to try an unknown brand?',
  },
];

export default function TestPage() {
  return (
    <main className="bg-ink min-h-screen">
      <div className="mx-auto max-w-[1600px] px-6 md:px-10 pb-28 pt-32 md:pt-40">
        <Reveal>
          <div className="eyebrow mb-4">Internal · Test drive</div>
          <h1 className="h-display text-white text-[clamp(2.4rem,5.5vw,4.6rem)] leading-[0.95] max-w-3xl">
            Help us <span className="text-stroxx-blue">break it.</span>
          </h1>
          <p className="mt-6 text-fog text-lg leading-relaxed max-w-xl">
            You are looking at the new STROXX brand site before the rest of the world. Use it like you
            would on a real job, on your phone and on a computer, and tell us everything: bugs, confusion,
            missing things, good ideas. Blunt beats polite.
          </p>
        </Reveal>

        <div className="mt-16 max-w-5xl">
          <Reveal>
            <div className="eyebrow mb-3">Six things to try</div>
          </Reveal>
          <div className="grid gap-5 md:grid-cols-2">
            {JOURNEYS.map((j, i) => (
              <Reveal key={j.title} delay={(i % 2) * 80}>
                <div className="glass glass-card glass-panel rounded-xl p-7 h-full">
                  <div className="text-stroxx-blue text-xs uppercase tracking-wider mb-3">{String(i + 1).padStart(2, '0')}</div>
                  <div className="text-white text-lg font-medium mb-2">{j.title}</div>
                  <p className="text-fog text-sm leading-relaxed">{j.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        <div className="mt-20 max-w-2xl" id="report">
          <Reveal>
            <div className="eyebrow mb-3">Found something?</div>
            <h2 className="h-display text-white text-[clamp(1.8rem,4vw,3rem)] leading-[0.96] mb-4">
              Tell us. Even the small stuff.
            </h2>
            <p className="text-fog leading-relaxed mb-8 max-w-xl">
              One report per finding is perfect. A typo counts. A feeling counts too
              (&ldquo;this page did not convince me&rdquo; is a great report).
            </p>
          </Reveal>
          <Reveal delay={80}>
            <FeedbackForm />
          </Reveal>
        </div>
      </div>
    </main>
  );
}
