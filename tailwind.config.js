/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#14251f',
        cream: '#fbfaf6',
        leaf: '#276a4f',
        lime: '#dff26a',
        coral: '#ff765e',
        mist: '#eef1ea',
      },
      fontFamily: {
        sans: ['Manrope', 'system-ui', 'sans-serif'],
        display: ['DM Serif Display', 'Georgia', 'serif'],
      },
      boxShadow: {
        soft: '0 18px 50px rgba(20,37,31,.10)',
      },
    },
  },
  plugins: [],
}
