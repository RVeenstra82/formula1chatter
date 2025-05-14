/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["'Titillium Web'", 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        'f1-red': '#e10600',
        'f1-dark': '#15151e',
        'f1-light': '#f5f5f5',
      },
    },
  },
  plugins: [],
} 