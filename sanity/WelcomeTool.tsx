'use client';

import { useMemo, useState } from 'react';
import { useCurrentUser } from 'sanity';
import { projectId } from './env';

/** "Welcome" Studio tab: the landing spot for new editors and the admin's
 *  invite flow. New editors get a personal greeting, the two reassurances
 *  that matter, and three steps into the tool. Admins get the invite
 *  button (Sanity's member management, where seats and roles live), a role
 *  cheat sheet, and a ready-made welcome message that points the newcomer
 *  straight back to this tab. */

const BLUE = '#0088C2';

export default function WelcomeTool() {
  const user = useCurrentUser();
  const firstName = (user?.name || '').split(' ')[0];
  const [copied, setCopied] = useState(false);

  const studioUrl = useMemo(() => {
    try {
      return `${window.location.origin}/studio`;
    } catch {
      return '/studio';
    }
  }, []);

  const welcomeMessage = `Welcome to the STROXX site team!

You now have access to the content studio. Everything is set up so you can start right away:

1. Accept the Sanity invite in your inbox (Google login works).
2. Open ${studioUrl}/welcome and follow the three steps there.
3. Golden rules: you can't break the design, and nothing goes live until you press Publish.

The Guide tab answers almost everything. Questions? Just reply to this message.`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(welcomeMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {}
  };

  const S = {
    wrap: { maxWidth: 860, margin: '0 auto', padding: '40px 24px 80px' } as const,
    eyebrow: { fontSize: 11, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase' as const, color: BLUE, marginBottom: 10 },
    h1: { fontSize: 30, fontWeight: 700, lineHeight: 1.15, marginBottom: 10 } as const,
    lead: { fontSize: 14.5, lineHeight: 1.6, opacity: 0.75, maxWidth: 560, marginBottom: 26 } as const,
    grid: { display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', marginBottom: 34 } as const,
    card: { border: '1px solid rgba(128,128,128,0.3)', borderRadius: 14, padding: 20, display: 'block', color: 'inherit', textDecoration: 'none' } as const,
    step: { display: 'inline-grid', placeItems: 'center', width: 26, height: 26, borderRadius: 999, background: 'rgba(0,136,194,0.14)', color: BLUE, fontSize: 12.5, fontWeight: 700, marginBottom: 12 } as const,
    cardTitle: { fontSize: 15, fontWeight: 600, marginBottom: 6 } as const,
    cardText: { fontSize: 13, lineHeight: 1.55, opacity: 0.7 } as const,
    ruleRow: { display: 'flex', flexWrap: 'wrap', gap: 14, marginBottom: 40 } as const,
    rule: { flex: '1 1 240px', border: `1px solid rgba(0,136,194,0.35)`, background: 'rgba(0,136,194,0.06)', borderRadius: 14, padding: '16px 18px', fontSize: 13.5, lineHeight: 1.55 } as const,
    h2: { fontSize: 19, fontWeight: 700, margin: '0 0 6px' } as const,
    sub: { fontSize: 13.5, lineHeight: 1.6, opacity: 0.72, maxWidth: 560, marginBottom: 18 } as const,
    btn: { display: 'inline-block', padding: '10px 20px', borderRadius: 999, background: BLUE, color: '#fff', fontSize: 13.5, fontWeight: 600, textDecoration: 'none', cursor: 'pointer', border: 'none' } as const,
    ghost: { display: 'inline-block', padding: '10px 20px', borderRadius: 999, border: '1px solid rgba(128,128,128,0.4)', background: 'transparent', color: 'inherit', fontSize: 13.5, cursor: 'pointer' } as const,
    roleName: { fontSize: 13.5, fontWeight: 600 } as const,
    roleText: { fontSize: 12.5, opacity: 0.7, lineHeight: 1.5 } as const,
    msg: { whiteSpace: 'pre-wrap' as const, fontSize: 13, lineHeight: 1.6, border: '1px solid rgba(128,128,128,0.3)', borderRadius: 12, padding: 16, opacity: 0.85, marginTop: 14 },
  };

  const steps = [
    {
      n: '1',
      title: 'Edit the site, visually',
      text: 'Open Edit site, click any text on the page preview, and type. Your words appear live. That is 95% of the job.',
      href: `${studioUrl}/presentation`,
    },
    {
      n: '2',
      title: 'Five minutes with the Guide',
      text: 'The Guide tab covers everything: pages, images, products, the newsletter, publishing. Skim it once, come back when stuck.',
      href: `${studioUrl}/guide`,
    },
    {
      n: '3',
      title: 'Know the building blocks',
      text: 'The brand guide and every landing-page block, rendered live with the exact names you will see in the "Add item" menu.',
      href: '/komponenter',
    },
  ];

  return (
    <div style={S.wrap}>
      <div style={S.eyebrow}>STROXX Studio</div>
      <h1 style={S.h1}>{firstName ? `Welcome, ${firstName}.` : 'Welcome.'}</h1>
      <p style={S.lead}>
        This studio runs the STROXX brand site. Words, images, pages, products, campaigns: you change
        them here and the site follows. Start with the three steps below.
      </p>

      <div style={S.ruleRow}>
        <div style={S.rule}>
          <strong>You can&#39;t break the design.</strong> Layout, motion and brand styling are locked in
          code. You edit content; the site stays premium by itself.
        </div>
        <div style={S.rule}>
          <strong>Nothing goes live until you publish.</strong> Every change is a private draft first.
          Publish when you are happy, and every version can be rolled back.
        </div>
      </div>

      <div style={S.grid}>
        {steps.map((s) => (
          <a key={s.n} href={s.href} style={S.card} target={s.href.startsWith('/') ? '_blank' : undefined} rel="noreferrer">
            <span style={S.step}>{s.n}</span>
            <div style={S.cardTitle}>{s.title}</div>
            <div style={S.cardText}>{s.text}</div>
          </a>
        ))}
      </div>

      <p style={{ ...S.sub, marginBottom: 44 }}>
        When you are comfortable: <a href={`${studioUrl}/dashboard`} style={{ color: BLUE }}>Dashboard</a> shows
        what readers do on the site, and <a href={`${studioUrl}/article-ai`} style={{ color: BLUE }}>Article AI</a> helps
        you write news. Every article shows a live preview of its LinkedIn card at the bottom of its own
        editing form, right where you set the share image.
      </p>

      {/* ── admin: invite a colleague ── */}
      <div style={S.eyebrow}>For administrators</div>
      <h2 style={S.h2}>Invite a colleague</h2>
      <p style={S.sub}>
        Invites are sent from Sanity&#39;s member management (that is where seats and roles live).
        Two minutes: send the invite there, then send them the welcome message below.
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 18 }}>
        <a href={`https://www.sanity.io/manage/project/${projectId}/members`} target="_blank" rel="noopener noreferrer" style={S.btn}>
          Open member management →
        </a>
        <button onClick={copy} style={S.ghost}>{copied ? 'Message copied ✓' : 'Copy welcome message'}</button>
      </div>

      <div style={{ display: 'grid', gap: 10, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', marginBottom: 6 }}>
        <div style={{ border: '1px solid rgba(128,128,128,0.3)', borderRadius: 12, padding: 14 }}>
          <div style={S.roleName}>Editor <span style={{ color: BLUE }}>· pick this one</span></div>
          <div style={S.roleText}>Creates, edits and publishes content. Right for everyone on the content team.</div>
        </div>
        <div style={{ border: '1px solid rgba(128,128,128,0.3)', borderRadius: 12, padding: 14 }}>
          <div style={S.roleName}>Viewer</div>
          <div style={S.roleText}>Read-only. For stakeholders who want to look without touching.</div>
        </div>
        <div style={{ border: '1px solid rgba(128,128,128,0.3)', borderRadius: 12, padding: 14 }}>
          <div style={S.roleName}>Administrator</div>
          <div style={S.roleText}>Everything, including members and Site settings. Keep this circle small; tracking and integration settings live there.</div>
        </div>
      </div>

      <div style={S.msg}>{welcomeMessage}</div>
      <p style={{ fontSize: 12, opacity: 0.55, marginTop: 10, lineHeight: 1.5 }}>
        The message links straight to this Welcome tab, so every new editor starts exactly here.
        Seats and available roles depend on the Sanity plan.
      </p>
    </div>
  );
}
