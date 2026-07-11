# STROXX — motion ruleset

The site should feel like **one continuous surface**, not a stack of sections. Motion is calm, weighted and blue-lit — never bouncy or fast.

## Principles

1. **One page, not sections.** Avoid hard cuts between blocks. Use generous `min-h` and let elements cross-fade/blur in as they enter, so scrolling feels like one flowing journey. On the **product page**, the pinned product cut-out travels *through* the page as you scroll rather than living in one section. The **homepage bag** is a load-time intro that settles in the hero (it does not travel on scroll).
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

## Slide-in reveals

`<Reveal from="…">` (`components/Reveal.tsx`) is the one entrance primitive. IntersectionObserver adds `.is-in`; CSS does the rest, all on the brand ease (`cubic-bezier(.16,1,.3,1)`, ~1.05s) with a blur-off so every entrance is one family.

- `from="up"` (default) — soft rise + blur. Body text, grids, small items.
- `from="left"` / `from="right"` — horizontal slide (desktop only; falls back to the rise on mobile so nothing overflows). Use to match a zig-zag layout: a block slides in **from its own side**.
- `from="far-left"` / `from="far-right"` — longer slide for hero pieces (the particle product, the guarantee film).
- `from="down"` — rare; small downward settle.

**Rhythm rule.** On alternating two-column rows, each side enters from its own edge (left column ← left, right column → right). The homepage category blocks, the product-page zig-zag sections, and the finder header all follow this so the eye is led down the page. Stagger paired items 80–120ms (`delay`).

`prefers-reduced-motion` collapses all of it to a plain fade.

## Glass cards — hover

`.glass-card` (any glass surface): on hover a concentrated bright STROXX-blue arc travels around the rim (shared `@property --a` + `glass-spin`, 4s) with a blurred copy tracking it for the bloom, and the card lifts on a soft blue box-shadow. Pure CSS — no per-card listeners.

`GlassCardGlow` adds the cursor-aware layer on top: it tracks the pointer as `--gx/--gy` and drives (a) a soft blue light pooled inside the card, blurred so it reads as light diffused through frosted glass — it sits *behind* the knocked-out product so it glows around the cut-out; and (b) `.glass-glow__refract`, a bright specular masked to the rim nearest the cursor (`mix-blend: screen`) — the Apple-glass edge refraction. The only JS is setting two CSS vars on move (React delegates the handler, so 100s of cards stay cheap).

## Trailing light — elastic

Where a product/bag travels on scroll, the blue light is a **separate elastic body** that trails it. The image leads (responsive lerp ~0.17), the light springs toward it with a soft stiffness (~0.03) and low friction (damping ~0.91–0.92) plus a little gravity, so it lags, overshoots and wobbles back — reading as a light genuinely tracking the image rather than glued to it. Implemented in `ProductExperience.tsx` (pinned product). The homepage bag is a load-time intro (`BagJourney.tsx` + geometry from `BagFill.tsx`), not a scroll traveller.

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

## Keyboard focus

One designed ring for every interactive element, defined once in `globals.css`: `:is(a, button, input, select, textarea, summary, [role='button'], [tabindex]):focus-visible` gets a 2px `rgba(0,136,194,.9)` outline with a 2px offset. It shows for keyboard focus only (`:focus-visible`), so mouse clicks stay clean, and the outline follows border-radius, so pills and chips get a pill-shaped ring. The selector's specificity (0,1,1) deliberately beats Tailwind's `outline-none` on the form fields; never add a bare `outline-none` without a visible replacement. The glass tiers add a soft blue box-shadow bloom on focus (`.glass-cta:focus-visible`, `.glass-btn:focus-visible`); those rules restate the FULL base shadow lists, so changing a glass tier's shadows means updating its focus variant in the same pass.

## Press

Press compression is uniform: interactive elements compress to `scale(.97)` on `:active`, on the hover/press ease.

- `.glass-cta` already had it; `.glass-btn:active` now matches.
- `.press` is the shared control-chip utility (finder/sort/filter chips, carousel arrows, chat quick-reply chips, the inline locale pills): a 0.25s `cubic-bezier(.2,.7,.2,1)` transition over color, background, border, opacity, box-shadow and transform, plus `:active { transform: scale(.97) }`. It restates the color properties on purpose so it can sit next to Tailwind's `transition-colors` without losing them.
- Exceptions by size: the specialist FAB uses `active:scale-[0.98]` (bigger element, smaller compression); the chat send button uses `active:scale-[.97]` on the hover/press ease.

## Small entrances (CSS primitives)

UI that mounts (menus, form states, chat) enters via plain CSS classes in `globals.css`, all on the entrance ease `cubic-bezier(.16,1,.3,1)`, enter-only (JS owns any exit):

- `.menu-in`: dropdown pop, opacity + `translateY(-6px)` + `scale(.98)` over .28s, transform-origin top right. The desktop locale switcher.
- `.state-in`: form success/error text rises softly (.45s). ContactForm, Newsletter, ProClubSignup, FeedbackForm.
- `.check-pop`: the confirmation check badge, the one earned pop of delight (`scale .6 → 1.08 → 1`, .5s, .08s delay). Pairs with `.state-in` on form success states.
- `.msg-in`: chat bubbles and the typing row (.4s rise), SpecialistChat.

## Overlays and modals

- Overlay fades: `.backdrop-in` (backdrop, .35s), `.overlay-in` (content rise, .35s), `.img-fade` (.3s; key the `<img>` by src so prev/next remounts it and the new image crosses in). The PhotoGallery lightbox uses all three; the newsletter popup backdrop uses `.backdrop-in`.
- The modal pattern (GuaranteeModal is the reference; DealerChooser matches it): mount, then a rAF-flipped `show` state drives a 300ms opacity fade on the backdrop and a 300ms `translateY(14px) scale(.97)` settle on the panel, on the entrance ease; close reverses it and unmounts after the transition (300ms close timeout on GuaranteeModal, 250ms delayed unmount on DealerChooser). The newsletter popup routes every close path through a 220ms fade-out `dismiss()`. All of these carry `motion-reduce:transition-none`.
- The SpecialistFab panel transitions `[opacity,transform]` on the entrance ease. FAQ rows and their plus/cross icon run on the hover/press ease, also with `motion-reduce:transition-none`.

## Always-on loops

- `.typing-dot`: the chat typing indicator, a calm 1.2s opacity pulse, never a bounce. Written in animation LONGHAND on purpose: SpecialistChat staggers the three dots with Tailwind `[animation-delay:*]` utilities, and an `animation:` shorthand would reset the delay.
- `.scrollhint-dot` / `.scrollhint-chevron`: the hero scroll hint (mouse glyph). CSS keyframes instead of SMIL so reduced-motion can actually stop it (translateY stands in for the old `cy` animation); `ScrollHint.tsx` stays a server component.
- Locate spinners (SpecialistFab, StoreFinder) are `motion-safe:animate-spin`.

## Reduced motion, the one block

Everything collapses under `prefers-reduced-motion: reduce`, and the block that does it sits LAST in `globals.css` so it wins the cascade. Two rules: keep it last, and register every NEW animation class in it. It silences the entrance and loop primitives above plus the older always-on loops (`.sf-pin--active::after`, `.blue-drift`), holds `.typing-dot` at a steady opacity, and kills the mobile menu's staggered rise via `#mobile-menu ... !important` (that stagger lives in inline styles, unreachable from CSS without `!important`, which makes the Nav's `#mobile-menu` id load-bearing). On the JS side, `CountUp` lands on the final number instantly under reduced motion, and the modal/panel transitions carry `motion-reduce:transition-none`.

## Safari and the seal

All Safari (iOS + macOS) can rasterise large `blur()`/`drop-shadow()` filter layers as opaque white. `GuaranteeSeal.tsx` therefore toggles `.gseal-holder--flat` under the house Safari UA guard (same family as BagFill/BagJourney): `filter: none` plus a small box-shadow on the flap's back face, so the peel keeps its depth without the filter layer.

## Owners

`components/Reveal.tsx` · `ScrollText.tsx` · `BagJourney.tsx` / `BagFill.tsx` · `ProductExperience.tsx` · `ParticleImage.tsx` · `CursorGlow.tsx` · `GlassButton.tsx` · tokens in `app/globals.css`.
