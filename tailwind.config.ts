import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#0d1117',
        surface: '#161b22',
        border: '#30363d',
        accent: '#58a6ff',
        'accent-hover': '#79c0ff',
        text: '#c9d1d9',
        'text-secondary': '#8b949e',
        'text-muted': '#6e7681',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      typography: {
        DEFAULT: {
          css: {
            color: '#c9d1d9',
            a: { color: '#58a6ff' },
            'a:hover': { color: '#79c0ff' },
            h1: { color: '#e6edf3' },
            h2: { color: '#e6edf3' },
            h3: { color: '#e6edf3' },
            h4: { color: '#e6edf3' },
            code: {
              color: '#f0f6fc',
              backgroundColor: '#161b22',
              borderRadius: '6px',
              padding: '0.2em 0.4em',
            },
            'code::before': { content: '""' },
            'code::after': { content: '""' },
            pre: {
              backgroundColor: '#161b22',
              borderRadius: '8px',
              border: '1px solid #30363d',
            },
            blockquote: {
              color: '#8b949e',
              borderLeftColor: '#30363d',
            },
            strong: { color: '#e6edf3' },
            th: { color: '#e6edf3' },
            'ol > li::marker': { color: '#8b949e' },
            'ul > li::marker': { color: '#8b949e' },
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}

export default config
