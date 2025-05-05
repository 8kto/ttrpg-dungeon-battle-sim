/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,js,ts}'],
  plugins: [],
  theme: {
    extend: {
      screens: {
        xxl: '1440px',
      },
      fontSize: {
        xxs: '0.625rem',
        xxxs: '0.5rem',
      },
    },
  },
}
