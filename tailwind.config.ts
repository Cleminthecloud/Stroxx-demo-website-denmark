import type { Config } from 'tailwindcss';
const config: Config = {
  /* lib/ MUST be scanned: lib/grid.ts holds the count-aware column classes
     as literal strings; without it they get purged and grids collapse to
     one column (the Jul 5 stats-band bug) */
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0B0C0E',
        carbon: '#111317',
        steel: '#171B21',
        paper: '#F6F5F3',
        fog: '#8A9199',
        line: '#23272E',
        stroxx: { red: '#EB0029', blue: '#0088C2', blueGlow: '#2FACE8' }
      },
      fontFamily: {
        display: ['var(--font-display)', 'Helvetica Neue', 'Arial', 'sans-serif'],
        sans: ['var(--font-sans)', 'Helvetica Neue', 'Arial', 'sans-serif']
      },
      letterSpacing: { tightest: '-0.04em' }
    }
  },
  plugins: []
};
export default config;
