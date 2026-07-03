import type { Metadata } from 'next';
import { readFileSync } from 'fs';
import path from 'path';
import React from 'react';

export const metadata: Metadata = {
  title: 'Editor guide',
  robots: { index: false, follow: false },
};

/** The editor guide, rendered from docs/STROXX-editor-guide.md so it is
 *  always the current version (every deploy ships the latest). Shown inside
 *  the Studio as the "Guide" tab and reachable directly at /guide. */

function inline(text: string, keyBase: string): React.ReactNode[] {
  // **bold**, `code`, [label](url); everything else passes through as-is
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g).filter(Boolean);
  return parts.map((p, i) => {
    const key = `${keyBase}-${i}`;
    if (p.startsWith('**') && p.endsWith('**')) {
      return <strong key={key} className="text-white font-medium">{p.slice(2, -2)}</strong>;
    }
    if (p.startsWith('`') && p.endsWith('`')) {
      return <code key={key} className="rounded bg-white/10 px-1.5 py-0.5 text-[0.9em] text-stroxx-blue">{p.slice(1, -1)}</code>;
    }
    const link = p.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (link) {
      return <a key={key} href={link[2]} className="text-stroxx-blue underline underline-offset-2" target="_blank" rel="noopener noreferrer">{link[1]}</a>;
    }
    return <React.Fragment key={key}>{p}</React.Fragment>;
  });
}

function renderMarkdown(md: string): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  const lines = md.split('\n');
  let list: string[] = [];
  let ordered = false;

  const flush = (key: string) => {
    if (!list.length) return;
    const items = list.map((li, i) => (
      <li key={`${key}-li-${i}`} className="text-fog leading-relaxed">{inline(li, `${key}-li-${i}`)}</li>
    ));
    out.push(
      ordered ? (
        <ol key={key} className="list-decimal pl-6 space-y-2 mb-5">{items}</ol>
      ) : (
        <ul key={key} className="list-disc pl-6 space-y-2 mb-5 marker:text-stroxx-blue">{items}</ul>
      )
    );
    list = [];
  };

  lines.forEach((raw, n) => {
    const line = raw.trimEnd();
    const key = `l${n}`;
    const ol = line.match(/^\d+\.\s+(.*)/);
    if (line.startsWith('- ')) {
      if (list.length && ordered) flush(key + 'sw');
      ordered = false;
      list.push(line.slice(2));
      return;
    }
    if (ol) {
      if (list.length && !ordered) flush(key + 'sw');
      ordered = true;
      list.push(ol[1]);
      return;
    }
    flush(key + 'f');
    if (!line.trim()) return;
    if (line.startsWith('### ')) {
      out.push(<h3 key={key} className="text-white text-lg font-medium mt-8 mb-3">{inline(line.slice(4), key)}</h3>);
    } else if (line.startsWith('## ')) {
      out.push(<h2 key={key} className="h-display text-white text-2xl md:text-3xl mt-12 mb-4">{inline(line.slice(3), key)}</h2>);
    } else if (line.startsWith('# ')) {
      out.push(<h1 key={key} className="h-display text-white text-4xl md:text-5xl leading-[0.95] mb-4">{inline(line.slice(2), key)}</h1>);
    } else if (line.startsWith('---')) {
      out.push(<hr key={key} className="border-line my-10" />);
    } else {
      out.push(<p key={key} className="text-fog leading-relaxed mb-4">{inline(line, key)}</p>);
    }
  });
  flush('end');
  return out;
}

export default function GuidePage() {
  let md = '';
  try {
    md = readFileSync(path.join(process.cwd(), 'docs', 'STROXX-editor-guide.md'), 'utf8');
  } catch {
    md = '# Editor guide\n\nThe guide file was not found in this deployment. Ask your administrator.';
  }
  return (
    <main className="bg-ink min-h-screen">
      <div className="mx-auto max-w-3xl px-6 md:px-10 pt-32 pb-28">
        <div className="eyebrow mb-6">Internal · Editor guide</div>
        {renderMarkdown(md)}
      </div>
    </main>
  );
}
