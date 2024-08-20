/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,js,ts}'],
  plugins: [require('daisyui')],
  // daisyUI config (optional - here are the default values)
  daisyui: {
    themes: [
      'dark',
      {
        emerald: {
          ...require('daisyui/src/theming/themes')['emerald'],
          '--rounded-btn': '0.25rem', // border radius rounded-btn utility class, used in buttons and similar element
          '--rounded-box': '0.25rem',
        },
      },
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
          't-primary-focus': '#ed697b',
          'primary-content': '#fff',

          secondary: '#34acba',
          'secondary-focus': '#72dcba',
          'bg-secondary-focus': '#72dcba',
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
      colors: {
        'text-primary-focus': '#ed697b',
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
