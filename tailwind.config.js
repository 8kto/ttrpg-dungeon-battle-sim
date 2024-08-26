/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,js,ts}'],
  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      {
        retroclone: {
          primary: '#ee9a95',
          'primary-focus': '#e76b65',
          'primary-content': '#252223',

          secondary: '#a4cbb4',
          'secondary-focus': '#85b79a',
          'bg-secondary-focus': '#85b79a',
          'secondary-content': '#252223',

          accent: '#ebdc99',
          'accent-focus': '#e1cb6b',
          'accent-content': '#252223',

          neutral: '#7c725a',
          'neutral-focus': '#423d33',
          'neutral-content': '#e4d8b4',

          'base-50': '#f5f4f1',
          'base-100': '#e6e2db',
          'base-200': '#cec7ba',
          'base-300': '#b2a592',
          'base-content': '#252223',

          info: '#1c92f2',
          success: '#009485',
          warning: '#ff9900',
          error: '#ff5724',

          '--rounded-box': '.25rem',
          '--rounded-btn': '.25rem',
          '--rounded-badge': '.25rem',

          '--animation-btn': '.25s',
          '--animation-input': '.2s',

          '--btn-text-case': 'uppercase',
          '--navbar-padding': '.5rem',
          '--border-btn': '1px',
        },
        retrogame: {
          primary: '#aa5574',
          'primary-focus': '#ed697b',
          'primary-content': '#fff',

          secondary: '#34acba',
          'secondary-focus': '#72dcba',
          'secondary-content': '#fff',

          accent: '#ffe07e',
          'accent-focus': '#e1cb6b',
          'accent-content': '#252223',

          neutral: '#2e242a',
          'neutral-focus': '#72464b',
          'neutral-content': '#e4d8b4',

          'base-50': '#f5f4f1',
          'base-100': '#e6e2db',
          'base-200': '#cec7ba',
          'base-300': '#b2a592',
          'base-content': '#252223',

          info: '#1c92f2',
          success: '#009485',
          warning: '#ff9900',
          error: '#ff5724',

          '--rounded-box': '0rem',
          '--rounded-btn': '0rem',
          '--rounded-badge': '0rem',

          '--animation-btn': '.25s',
          '--animation-input': '.2s',

          '--btn-text-case': 'uppercase',
          '--navbar-padding': '.5rem',
          '--border-btn': '1px',
        },
      },
    ], // false: only light + dark | true: all themes | array: specific themes like this ["light", "dark", "cupcake"]
    base: true, // applies background color and foreground color for root element by default
    styled: true, // include daisyUI colors and design decisions for all components
    utils: true, // adds responsive and modifier utility classes
    prefix: '', // prefix for daisyUI classnames (components, modifiers and responsive class names. Not colors)
    logs: true, // Shows info about daisyUI version and used config in the console when building your CSS
    themeRoot: ':root', // The element that receives theme color CSS variables
  },
  theme: {
    extend: {
      screens: {
        xxl: '1440px',
      },
      colors: {
        'primary-focus': '#ed697b',
        'secondary-focus': '#72dcba',
        'accent-focus': '#e1cb6b',
        'neutral-focus': '#72464b',
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
        ntrl: {
          50: '#eae0e2', // Very light neutral (light purple)
          100: '#d5c2c6', // Light neutral
          200: '#bfa4a9', // Lighter neutral
          300: '#a9878c', // Light medium neutral
          400: '#936a70', // Medium neutral
          500: '#7d4d54', // Base neutral
          600: '#67313a', // Darker medium neutral
          700: '#502528', // Dark neutral
          800: '#3a1a1d', // Darker neutral
          900: '#2e242a', // Original very dark purple neutral
        },
      },
      fontFamily: {
        'averia-serif': ['"Averia Serif Libre"', 'serif'],
      },
      fontSize: {
        xxs: '0.625rem',
        xxxs: '0.5rem',
      },
    },
  },
}
