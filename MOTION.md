# STROXX — motion ruleset

The site should feel like **one continuous surface**, not a stack of sections. Motion is calm, weighted and blue-lit — never bouncy or fast.

## Principles

1. **One page, not sections.** Avoid hard cuts between blocks. Use generous `min-h` and let elements cross-fade/blur in as they enter, so scrolling feels like one flowing journey. The hero product (homepage bag, product cut-out) travels *through* the page rather than living in one section.
2. **Soft reveal.** Content enters with a soft blur + rise, never a hard pop. `.reveal`: `opacity 0→1`, `translateY 26px→0`, `blur 8px→0`, over ~1s on `cubic-bezier(.16,1,.3,1)`. Stagger siblings by 70–90ms.
3. **Scroll-driven, lerped.** Anything tied to scroll (bag, product, particles) is sampled from keyframes and **lerped** toward the target (~0.1 factor) so it glides — never snaps. Synced to Lenis smooth scroll.
4. **Text reveal (GSAP).** Big statements use `ScrollText`: words fade from `opacity .16 → 1` with `scrub` ScrollTrigger as they pass through the viewport. Registered once; `window.ScrollTrigger.update()` driven by Lenis.
5. **Blue light follows the cursor.** Soft, low-intensity radial blue glow tracks the pointer on heroes and CTAs (`CursorGlow`, `.glass-cta__glow`). Subtle — it hints, it doesn't shout.
6. **Apple-glass surfaces.** Interactive elements are frosted glass: edge reflection (inset top highlight), a soft blue gradient stroke (animated on CTAs), a small drop shadow, and a gentle `translateY(-1.5px)` lift on hover.
7. **Respect `prefers-reduced-motion`.** All of the above collapse to static/instant states.

## Timing

- Reveals: ~1s, `cubic-bezier(.16,1,.3,1)`.
- Hover/press: 0.25s, `cubic-bezier(.2,.7,.2,1)`.
- Scroll lerp: 0.08–0.12 per frame.
- Animated CTA edge: 7s linear loop.

## Buttons — the hierarchy

One CTA primitive (`components/GlassButton.tsx`, styled by `.glass-cta` in `globals.css`). Never hand-roll a button. Four tiers plus controls:

| Tier | How | When | Rule |
|---|---|---|---|
| **Primary** | `<GlassButton href>` (blue glass fill, animated edge-light, cursor glow) | The single decisive action of a section — usually "Køb hos Carl Ras" or the main on-page journey | **Max one per section.** If two feel equal, one must drop to secondary. |
| **Secondary** | `<GlassButton variant="ghost">` | Supporting action ("Tekniske specs", "Køb hos Carl Ras" when explore is primary) | Identical geometry to primary, no fill. |
| **Tertiary** | `<Link className="link-arrow">… <ArrowRight/></Link>` | Low-emphasis navigation ("Se hele kategorien") | No box. Text + sliding arrow only. |
| **Utility / icon** | `<GlassLink>` / `<GlassIcon>` (`.glass-btn`) | Icon actions — Ring, Email, social | Small frosted pill, no blue fill. |
| **Controls** | rounded-full bordered toggles (finder chips, sort) | Filters / state toggles, *not* CTAs | Active = `bg-stroxx-blue`; idle = `border-line`. Never glass — controls must read as controls. |

**Sizing.** `size="md"` (default) everywhere; `size="sm"` only in dense rows (product cards). **Submit buttons** use `<GlassButton submit>` (renders a `<button type="submit">`).

**Alignment.** Button rows are `flex items-center gap-3`. All CTAs in a row share one tier-pair (primary + ghost), so heights and radii always match.

**Order.** Primary first (left), secondary after. On the product page the primary "Køb" always precedes the ghost "Tekniske specs".

## Owners

`components/Reveal.tsx` · `ScrollText.tsx` · `BagScroller.tsx` · `ProductExperience.tsx` · `ParticleImage.tsx` · `CursorGlow.tsx` · `GlassButton.tsx` · tokens in `app/globals.css`.
