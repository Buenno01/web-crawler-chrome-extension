import plugin from 'tailwindcss/plugin';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        box: {
          /* TODO: apply dynamic colors to box */
        }
        /* TODO: add color system names to color options. eg. accent, background, foreground, etc. */
      },
    },
  },
  plugins: [],
} 