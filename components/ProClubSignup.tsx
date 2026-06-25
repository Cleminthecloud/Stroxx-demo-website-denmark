'use client';
import { useState } from 'react';
import GlassButton from '@/components/GlassButton';

export default function ProClubSignup() {
  const [done, setDone] = useState(false);
  const [email, setEmail] = useState('');

  return (
    <div className="glass-panel glass-panel--frost rounded-xl p-7">
      <div className="eyebrow mb-3">Pro Club</div>
      <h3 className="text-white font-display font-bold text-2xl mb-2">Know it before everyone else</h3>
      <p className="text-fog text-sm mb-5">
        Early access and specialist tips, straight to your inbox. A couple of emails a month, tops.
        No spam.
      </p>
      {done ? (
        <div className="text-white bg-steel border border-line rounded-sm px-4 py-3 text-sm">
          You're in. Check your inbox for the welcome. 👊
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (email) setDone(true);
          }}
          className="flex flex-col sm:flex-row gap-2"
        >
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            className="flex-1 bg-ink border border-line rounded-sm px-4 py-2.5 text-sm text-white placeholder:text-fog/60 focus:border-fog outline-none"
          />
          <GlassButton submit>Sign up</GlassButton>
        </form>
      )}
      <p className="text-fog/60 text-[11px] mt-3">
        Demo: the form connects to Marketo Engage in the final solution.
      </p>
    </div>
  );
}
