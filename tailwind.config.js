/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,js,ts}'],
  plugins: [],
  theme: {
    extend: {
      colors: {
        gen: {
          50: '#f5f4f1',
          100: '#e6e2db',
          200: '#cec7ba',
          300: '#b2a592',
          400: '#9e8c77',
          500: '#8d7965',
          600: '#786456',
          700: '#614f47',
          800: '#54453f',
          900: '#4a3d39',
          950: '#29201f',
        },
      },
      fontSize: {
        xxs: '0.625rem',
        xxxs: '0.5rem',
      },
    },
  },
}
