import type { Config } from 'tailwindcss';
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0B0C0E',
        carbon: '#111317',
        steel: '#171B21',
        paper: '#F6F5F3',
        fog: '#8A9199',
        line: '#23272E',
        stroxx: { red: '#EB0029', blue: '#0082CA', blueGlow: '#2BA6E8' }
      },
      fontFamily: {
        display: ['var(--font-display)', 'Helvetica Neue', 'Arial', 'sans-serif'],
        sans: ['var(--font-sans)', 'Helvetica Neue', 'Arial', 'sans-serif']
      },
      letterSpacing: { tightest: '-0.04em' },
      keyframes: {
        grain: { '0%,100%': { transform: 'translate(0,0)' }, '50%': { transform: 'translate(-2%,1%)' } }
      }
    }
  },
  plugins: []
};
export default config;
