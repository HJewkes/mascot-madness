/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          primary: {
            DEFAULT: 'var(--color-brand-primary)',
            light: 'var(--color-brand-primary-light)',
            dark: 'var(--color-brand-primary-dark)',
            subtle: 'var(--color-brand-primary-subtle)',
            hover: 'var(--color-brand-primary-hover)',
            active: 'var(--color-brand-primary-active)',
          },
          secondary: {
            DEFAULT: 'var(--color-brand-secondary)',
            light: 'var(--color-brand-secondary-light)',
            dark: 'var(--color-brand-secondary-dark)',
            subtle: 'var(--color-brand-secondary-subtle)',
            hover: 'var(--color-brand-secondary-hover)',
            active: 'var(--color-brand-secondary-active)',
          },
        },
        'on-brand': {
          primary: 'var(--color-on-brand-primary)',
          secondary: 'var(--color-on-brand-secondary)',
        },
        status: {
          success: {
            DEFAULT: 'var(--color-status-success)',
            light: 'var(--color-status-success-light)',
            dark: 'var(--color-status-success-dark)',
            subtle: 'var(--color-status-success-subtle)',
          },
          error: {
            DEFAULT: 'var(--color-status-error)',
            light: 'var(--color-status-error-light)',
            dark: 'var(--color-status-error-dark)',
            subtle: 'var(--color-status-error-subtle)',
          },
          warning: {
            DEFAULT: 'var(--color-status-warning)',
            light: 'var(--color-status-warning-light)',
            dark: 'var(--color-status-warning-dark)',
            subtle: 'var(--color-status-warning-subtle)',
          },
          info: {
            DEFAULT: 'var(--color-status-info)',
            light: 'var(--color-status-info-light)',
            dark: 'var(--color-status-info-dark)',
            subtle: 'var(--color-status-info-subtle)',
          },
        },
        surface: {
          base: 'var(--color-surface-base)',
          elevated: 'var(--color-surface-elevated)',
          raised: 'var(--color-surface-raised)',
          overlay: 'var(--color-surface-overlay)',
          input: 'var(--color-surface-input)',
        },
        background: {
          base: 'var(--color-background-base)',
          DEFAULT: 'var(--color-background-default)',
          subtle: 'var(--color-background-subtle)',
        },
        text: {
          primary: 'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
          tertiary: 'var(--color-text-tertiary)',
          disabled: 'var(--color-text-disabled)',
          inverse: 'var(--color-text-inverse)',
          link: {
            DEFAULT: 'var(--color-text-link)',
            hover: 'var(--color-text-link-hover)',
          },
        },
        border: {
          DEFAULT: 'var(--color-border-default)',
          subtle: 'var(--color-border-subtle)',
          strong: 'var(--color-border-strong)',
          focus: 'var(--color-border-focus)',
        },
        interactive: {
          hover: 'var(--color-interactive-hover)',
          focus: 'var(--color-interactive-focus)',
          active: 'var(--color-interactive-active)',
          selected: 'var(--color-interactive-selected)',
        },
        divider: 'var(--color-divider)',
      },
      fontFamily: {
        sans: ['var(--font-family-sans)', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        body: ['var(--font-family-body)', 'sans-serif'],
        heading: ['var(--font-family-heading)', 'sans-serif'],
        mono: ['var(--font-family-mono)', 'monospace'],
      },
      boxShadow: {
        'glow-primary': '0 0 20px 2px rgba(var(--color-brand-primary-rgb, 255, 121, 0), 0.4)',
        'glow-secondary': '0 0 20px 2px rgba(var(--color-brand-secondary-rgb, 64, 109, 135), 0.4)',
      },
      transitionTimingFunction: {
        out: 'cubic-bezier(0.22, 1, 0.36, 1)',
        'in-out': 'cubic-bezier(0.65, 0, 0.35, 1)',
        spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      transitionDuration: {
        fast: '150ms',
        normal: '250ms',
        slow: '400ms',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-down': {
          '0%': { opacity: '0', transform: 'translateY(-8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-right': {
          '0%': { opacity: '0', transform: 'translateX(100%)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 250ms cubic-bezier(0.22, 1, 0.36, 1)',
        'slide-down': 'slide-down 250ms cubic-bezier(0.22, 1, 0.36, 1)',
        'slide-in-right': 'slide-in-right 300ms cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
}
