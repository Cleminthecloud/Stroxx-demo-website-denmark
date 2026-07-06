/** Animated brand marks for the top of /brand. Pure inline SVG with SMIL
 *  animations: no JS, no CSS filters (the iOS Safari white-box rule), and
 *  they respect the brand: blue is the only accent, motion is calm and
 *  engineered, never bouncy. */

/** The blue line that draws itself, then breathes. The brand's underline. */
export function DrawLine() {
  return (
    <svg viewBox="0 0 560 120" className="h-24 w-full max-w-xl" aria-hidden="true">
      <path d="M20 78 H420" stroke="#23272E" strokeWidth="2" />
      <path d="M20 78 H420" stroke="#0088C2" strokeWidth="4" strokeLinecap="round" strokeDasharray="400" strokeDashoffset="400">
        <animate attributeName="stroke-dashoffset" from="400" to="0" dur="1.6s" fill="freeze" calcMode="spline" keySplines="0.22 1 0.36 1" />
      </path>
      <circle cx="446" cy="78" r="7" fill="#0088C2">
        <animate attributeName="opacity" values="0;0;1;0.55;1" keyTimes="0;0.55;0.7;0.85;1" dur="2.6s" fill="freeze" />
      </circle>
      <text x="20" y="44" fill="#F6F5F3" fontFamily="Helvetica Neue, Arial, sans-serif" fontSize="34" fontWeight="500" letterSpacing="-1">
        Same feel. Far from the price.
      </text>
    </svg>
  );
}

/** A calm grid of dots that light up in a wave: the range, one SKU at a time. */
export function PulseGrid() {
  const cols = 12;
  const rows = 4;
  const dots = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const delay = ((c + r) * 0.14).toFixed(2);
      dots.push(
        <circle key={`${r}-${c}`} cx={16 + c * 26} cy={14 + r * 26} r="3.4" fill="#0088C2" opacity="0.14">
          <animate
            attributeName="opacity"
            values="0.14;0.9;0.14"
            dur="3.4s"
            begin={`${delay}s`}
            repeatCount="indefinite"
            calcMode="spline"
            keySplines="0.4 0 0.2 1;0.4 0 0.2 1"
          />
        </circle>
      );
    }
  }
  return (
    <svg viewBox="0 0 320 106" className="h-24 w-auto" aria-hidden="true">
      {dots}
    </svg>
  );
}
