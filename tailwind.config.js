import { defineConfig } from 'tailwindcss';

/** @type {import('tailwindcss').Config} */
export default defineConfig({
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {},
  },
  plugins: [],
});
