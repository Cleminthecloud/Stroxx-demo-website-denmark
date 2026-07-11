/** Minimal animated scroll indicator: a mouse with a travelling wheel dot
 *  and a soft chevron pulse. CSS keyframes (globals.css .scrollhint-*) rather
 *  than SMIL so prefers-reduced-motion collapses it. Pure SVG, no JS. */
export default function ScrollHint() {
  return (
    <div className="flex flex-col items-center gap-2 opacity-70">
      <svg width="24" height="38" viewBox="0 0 24 38" fill="none" aria-hidden>
        <rect x="1.5" y="1.5" width="21" height="35" rx="10.5" stroke="#8A9199" strokeWidth="1.4" />
        <circle cx="12" cy="9" r="2.4" fill="#fff" className="scrollhint-dot" />
      </svg>
      <svg width="16" height="9" viewBox="0 0 16 9" fill="none" aria-hidden>
        <path
          d="M1 1l7 6 7-6"
          stroke="#0088C2"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="scrollhint-chevron"
        />
      </svg>
    </div>
  );
}
