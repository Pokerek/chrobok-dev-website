/** @type {import('tailwindcss').Config} */

export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: ['class'],
  prefix: '',
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        'page-bg': '#FAFAFA',
        'element-bg': '#F0F0F0',
        'text-primary': '#000000',
        'text-secondary': '#333333',
        'border-default': '#000000',
        'hover-bg': '#E8E8E8',
        'focus-ring': '#000000',
      },
      fontFamily: {
        heading: ['Ramaraja', 'serif'],
        body: ['IBM Plex Mono', 'monospace'],
      },
      spacing: {
        section: '2rem', // 32px
        element: '1.5rem', // 24px
        card: '1.5rem', // 24px
        container: '2rem', // 32px
        tight: '0.5rem', // 8px — rhythm inside an element (heading/meta, list items, chip rows)
      },
      gap: {
        grid: '3rem', // 48px
      },
      gridTemplateColumns: {
        // Section-level "label | content" skeleton; collapses to 1 column below md.
        section: 'minmax(0, 12rem) minmax(0, 1fr)',
      },
      // Focus-visible ring token: the ring colour is the design-system focus-ring
      // token and the offset matches the page background, so `ring-2 ring-offset-2`
      // renders correctly without ever hard-coding a colour at the call site.
      ringColor: ({ theme }) => ({ DEFAULT: theme('colors.focus-ring') }),
      ringOffsetColor: ({ theme }) => ({ DEFAULT: theme('colors.page-bg') }),
    },
    // Square corners are the design identity: every named radius resolves to 0 so
    // `rounded-md` / `rounded-lg` / `rounded-full` can never leak a rounded corner.
    borderRadius: {
      none: '0px',
      sm: '0px',
      DEFAULT: '0px',
      md: '0px',
      lg: '0px',
      xl: '0px',
      '2xl': '0px',
      '3xl': '0px',
      full: '0px',
    },
  },
  plugins: [require('tailwindcss-animate')],
};
