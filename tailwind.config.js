/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        'primary-hover': 'var(--color-primary-hover)',
        'primary-light': 'var(--color-primary-light)',
        'primary-dark': 'var(--color-primary-dark)',
        'bg-main': 'var(--color-bg-main)',
        'bg-dc': 'var(--color-bg-dc)',
        'bg-view': 'var(--color-bg-view)',
        'bg-tertiary': 'var(--color-bg-tertiary)',
        'bg-sidebar': 'var(--color-bg-sidebar)',
        'text-main': 'var(--color-text-main)',
        'text-secondary': 'var(--color-text-secondary)',
        'text-description': 'var(--color-text-description)',
        'text-active': 'var(--color-active-text)',
        'border-default': 'var(--color-border)',
        'border-light': 'var(--color-border-light)',
      },
      width: {
        'sidebar': 'var(--sidebar-width)',
      },
      height: {
        'header': 'var(--header-height)',
        'player': 'var(--player-height)',
      },
      backdropBlur: {
        'glass': '20px',
      },
    },
  },
  plugins: [],
}