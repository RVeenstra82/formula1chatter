/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["'Barlow Condensed'", 'Inter', 'system-ui', 'sans-serif'],
        body: ["'Barlow'", 'Inter', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        'f1': '0.05em',
      },
      colors: {
        'f1-red': '#e10600',
        'f1-dark': '#15151e',
        'f1-light': '#f5f5f5',
        'f1-bg': '#0a0a0f',
        'f1-surface': '#15151e',
        'f1-surface-elevated': '#1e1e2e',
        'f1-border': '#2d2d44',
        'podium-gold': '#fbbf24',
        'podium-silver': '#9ca3af',
        'podium-bronze': '#f97316',
      },
    },
  },
  plugins: [],
}
