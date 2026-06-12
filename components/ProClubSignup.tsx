'use client';
import { useState } from 'react';
import GlassButton from '@/components/GlassButton';

export default function ProClubSignup() {
  const [done, setDone] = useState(false);
  const [email, setEmail] = useState('');

  return (
    <div className="glass-panel glass-panel--frost rounded-xl p-7">
      <div className="eyebrow mb-3">Pro Club</div>
      <h3 className="text-white font-display font-bold text-2xl mb-2">Bliv klogere før alle andre</h3>
      <p className="text-fog text-sm mb-5">
        Tidlig adgang, specialist-tips og de skarpeste priser, direkte i indbakken. Maks et par mails
        om måneden. Ingen spam.
      </p>
      {done ? (
        <div className="text-white bg-steel border border-line rounded-sm px-4 py-3 text-sm">
          Tak! Vi har dig nu. Tjek din indbakke for velkomsten. 👊
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
            placeholder="din@mail.dk"
            className="flex-1 bg-ink border border-line rounded-sm px-4 py-2.5 text-sm text-white placeholder:text-fog/60 focus:border-fog outline-none"
          />
          <GlassButton submit>Tilmeld</GlassButton>
        </form>
      )}
      <p className="text-fog/60 text-[11px] mt-3">
        Demo: formularen kobles til Marketo Engage i den endelige løsning.
      </p>
    </div>
  );
}
