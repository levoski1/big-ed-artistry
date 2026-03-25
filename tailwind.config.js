/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // These map to CSS variables so they adapt to theme
        gold: {
          primary: 'var(--gold-primary)',
          light:   'var(--gold-light)',
          dark:    'var(--gold-dark)',
          accent:  'var(--gold-accent)',
        },
        'bg-dark':  'var(--bg-dark)',
        'bg-card':  'var(--bg-card)',
        'text-main': 'var(--text-primary)',
        'text-sub':  'var(--text-secondary)',
        'text-dim':  'var(--text-muted)',
        'border':    'var(--border-color)',
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'serif'],
        body:    ['"Libre Franklin"',     'sans-serif'],
      },
      transitionDuration: {
        theme: '350ms',
      },
    },
  },
  plugins: [],
}
