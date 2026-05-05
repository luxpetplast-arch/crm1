import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Theme-aware colors using CSS variables
        theme: {
          bg: {
            primary: 'var(--bg-primary)',
            secondary: 'var(--bg-secondary)',
            tertiary: 'var(--bg-tertiary)',
            card: 'var(--bg-card)',
            hover: 'var(--bg-hover)',
            active: 'var(--bg-active)',
          },
          text: {
            primary: 'var(--text-primary)',
            secondary: 'var(--text-secondary)',
            tertiary: 'var(--text-tertiary)',
            muted: 'var(--text-muted)',
            inverse: 'var(--text-inverse)',
          },
          border: {
            primary: 'var(--border-primary)',
            secondary: 'var(--border-secondary)',
            hover: 'var(--border-hover)',
            focus: 'var(--border-focus)',
          },
          accent: {
            primary: 'var(--accent-primary)',
            secondary: 'var(--accent-secondary)',
            success: 'var(--accent-success)',
            warning: 'var(--accent-warning)',
            danger: 'var(--accent-danger)',
            info: 'var(--accent-info)',
          },
        },
        // Legacy colors for backward compatibility
        primary: '#1e40af',
        secondary: '#0f766e',
        accent: '#f59e0b',
        danger: '#dc2626',
        success: '#16a34a',
        warning: '#ea580c',
      },
      backgroundColor: {
        theme: {
          primary: 'var(--bg-primary)',
          secondary: 'var(--bg-secondary)',
          card: 'var(--bg-card)',
        },
      },
      textColor: {
        theme: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-muted)',
        },
      },
      borderColor: {
        theme: {
          primary: 'var(--border-primary)',
          secondary: 'var(--border-secondary)',
        },
      },
      boxShadow: {
        'theme-sm': 'var(--shadow-sm)',
        'theme-md': 'var(--shadow-md)',
        'theme-lg': 'var(--shadow-lg)',
        'theme-xl': 'var(--shadow-xl)',
      },
    },
  },
  plugins: [],
}
export default config
