/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'purple-brand': '#9333ea',
        'dark-purple': '#663089',
        'cyan-accent': '#0cbad6',
        'blue-soft': '#6f93ff',
        'violet-soft': '#a66cff',
        'navy': '#01014B',
      },
    },
  },
  plugins: [],
}
