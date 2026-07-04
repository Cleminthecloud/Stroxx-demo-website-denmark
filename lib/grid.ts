/** Count-aware Tailwind column classes.
 *
 *  Editors add and remove cards freely in the CMS; these maps pick a column
 *  count that keeps the row balanced at any item count (2 items become two
 *  halves instead of two thirds and a hole, 4 becomes a clean 2x2, etc.).
 *  Tailwind's JIT only generates classes it can see as literal strings, so
 *  these MUST stay lookup expressions with full class names, never template
 *  interpolation like `md:grid-cols-${n}`. */

/** Glass/feature card grids that top out at 3 columns (md+). */
export const cardCols = (n: number): string =>
  n <= 2 || n === 4 ? 'md:grid-cols-2' : 'md:grid-cols-3';

/** Testimonial-style grids: 2-up on md, 3-up on lg when the count fills it. */
export const testimonialCols = (n: number): string =>
  n <= 2 || n === 4 ? 'md:grid-cols-2' : 'md:grid-cols-2 lg:grid-cols-3';

/** Product card grids that top out at 4 columns on lg. */
export const productCols = (n: number): string =>
  n <= 2 ? 'lg:grid-cols-2' : n === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-4';

/** Product card grids that top out at 5 columns on lg (monthly winners). */
export const productColsWide = (n: number): string =>
  n <= 2 ? 'lg:grid-cols-2' : n === 3 ? 'lg:grid-cols-3' : n === 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-5';

/** Stat bands with sm breakpoint (homepage stats). */
export const statColsSm = (n: number): string =>
  n === 1 ? 'sm:grid-cols-1' : n === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-3';

/** Unprefixed 3-col grids (landing reframe stats). */
export const colsPlain = (n: number): string =>
  n === 1 ? 'grid-cols-1' : n === 2 ? 'grid-cols-2' : 'grid-cols-3';
