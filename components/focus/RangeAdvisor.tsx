'use client';
import { useId, useMemo, useState } from 'react';
import { advisorResult, fillTemplate, type AdvisorBand } from '@/lib/focus';

/** Slider advisor: the visitor sets a value (door thickness), the block
 *  answers with a recommendation (spindle length). The rule is data, editable
 *  in the CMS as "up to X → recommend Y" steps; the maths is lib/focus
 *  advisorResult (unit-tested). Two bars visualise value against result. */
export default function RangeAdvisor({
  label,
  unit = '',
  min,
  max,
  step = 1,
  initial,
  bands,
  resultTemplate,
  valueLabel,
  resultLabel,
}: {
  label: string;
  unit?: string;
  min: number;
  max: number;
  step?: number;
  initial?: number;
  bands: AdvisorBand[];
  resultTemplate?: string;
  valueLabel?: string;
  resultLabel?: string;
}) {
  const id = useId();
  const lo = Math.min(min, max);
  const hi = Math.max(min, max);
  const start = Number.isFinite(initial) ? Math.min(hi, Math.max(lo, initial as number)) : Math.round((lo + hi) / 2);
  const [v, setV] = useState(start);
  const band = advisorResult(v, bands);
  const result = band?.result ?? '';
  const options = useMemo(() => [...new Set((bands || []).map((b) => b.result))], [bands]);
  const pct = hi === lo ? 0 : (v - lo) / (hi - lo);
  const resultNum = Number(String(result).replace(',', '.'));
  const resultMax = Math.max(...options.map((o) => Number(String(o).replace(',', '.'))).filter(Number.isFinite), 1);
  const ticks = [lo, lo + (hi - lo) / 3, lo + (2 * (hi - lo)) / 3, hi].map((x) => Math.round(x));

  return (
    <div className="rounded-2xl border border-line bg-carbon p-6 md:p-8">
      <div className="mb-4 flex items-baseline justify-between gap-4">
        <label htmlFor={id} className="text-sm uppercase tracking-wider text-fog">
          {label}
        </label>
        <output htmlFor={id} className="h-display text-3xl text-white md:text-4xl">
          {v} {unit}
        </output>
      </div>
      <input
        id={id}
        type="range"
        min={lo}
        max={hi}
        step={step || 1}
        value={v}
        onChange={(e) => setV(Number(e.target.value))}
        aria-valuetext={`${v} ${unit}`}
        className="focus-range w-full"
        style={{ ['--p' as string]: `${(pct * 100).toFixed(2)}%` }}
      />
      <div className="mt-2 flex justify-between text-xs text-fog" aria-hidden>
        {ticks.map((x, i) => (
          <span key={i}>
            {x}
            {i === ticks.length - 1 && unit ? ` ${unit}` : ''}
          </span>
        ))}
      </div>

      {/* value versus recommendation, drawn to scale */}
      <div className="mt-8 grid gap-3" aria-hidden>
        <div className="flex items-center gap-3">
          <div className="h-3 rounded-full bg-white/70 transition-[width] duration-300" style={{ width: `${Math.max(8, (v / Math.max(hi, resultMax)) * 100)}%` }} />
          {valueLabel && <em className="whitespace-nowrap text-xs not-italic text-fog">{fillTemplate(valueLabel, v, result)}</em>}
        </div>
        {Number.isFinite(resultNum) && (
          <div className="flex items-center gap-3">
            <div className="h-3 rounded-full bg-stroxx-blue transition-[width] duration-300" style={{ width: `${Math.max(8, (resultNum / Math.max(hi, resultMax)) * 100)}%` }} />
            {resultLabel && <em className="whitespace-nowrap text-xs not-italic text-stroxx-blueGlow">{fillTemplate(resultLabel, v, result)}</em>}
          </div>
        )}
      </div>

      <div className="mt-8 flex flex-col gap-4 border-t border-line pt-6 md:flex-row md:items-center md:justify-between">
        <p className="text-lg font-medium text-white" aria-live="polite">
          {fillTemplate(resultTemplate || '{result}', v, result)}
        </p>
        {options.length > 1 && (
          <div className="flex flex-wrap gap-1.5" aria-hidden>
            {options.map((o) => (
              <span
                key={o}
                className={`min-w-[2.75rem] rounded-full border px-2.5 py-1 text-center text-xs transition-colors ${
                  o === result ? 'border-stroxx-blue bg-stroxx-blue text-white' : 'border-white/15 text-fog'
                }`}
              >
                {o}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
