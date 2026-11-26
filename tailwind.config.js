/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Colours taken from the Heecart catalog: black panels, golden yellow accents, warm cream background.
      colors: {
        gold: {
          50: '#fff9e6',
          100: '#fff0bf',
          200: '#ffe17f',
          300: '#ffd03f',
          400: '#fbbf14',
          500: '#f5b301',
          600: '#d99a00',
          700: '#b07a00',
          800: '#7d5700',
          900: '#4d3600',
        },
        ink: {
          DEFAULT: '#0d0d0d',
          800: '#1a1a1a',
          700: '#262626',
          600: '#3a3a3a',
        },
        cream: '#fff8ec',
        whatsapp: '#25d366',
      },
      fontFamily: {
        sans: ['Poppins', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        script: ['"Dancing Script"', 'cursive'],
      },
    },
  },
  plugins: [],
}
