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
      },
      gap: {
        grid: '3rem', // 48px
      },
      borderRadius: {
        DEFAULT: '0px',
      },
      minHeight: {
        'without-footer': 'calc(100dvh - 33px)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
