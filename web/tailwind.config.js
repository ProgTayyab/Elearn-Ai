/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: {
          light: '#F7F9FC',
          dark: '#0A0A0F',
        },
        foreground: {
          light: '#0F172A',
          dark: '#FAFAFA',
        },
        card: {
          light: '#FFFFFF',
          dark: '#18181F',
        },
        primary: {
          DEFAULT: '#6366F1',
          foreground: '#FFFFFF',
        },
        accent: {
          DEFAULT: '#A855F7',
          foreground: '#FFFFFF',
        },
        secondary: {
          light: '#EEF2F7',
          dark: '#25252E',
        },
        muted: {
          light: '#EEF2F7',
          dark: '#25252E',
          foreground: {
            light: '#64748B',
            dark: '#A1A1AA',
          }
        },
        border: {
          light: 'rgba(0,0,0,0.05)',
          dark: 'rgba(255,255,255,0.08)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
