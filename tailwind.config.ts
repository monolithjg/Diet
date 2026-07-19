import type { Config } from 'tailwindcss'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          'sans-serif',
        ],
      },
      colors: {
        background: "var(--bg)",
        surface: "var(--surface)",
        foreground: "var(--fg)",
        muted: "var(--muted)",
        "muted-foreground": "var(--muted)",
        primary: {
          50: "#e8f0fe",
          400: "#669df6",
          600: "#1967d2",
          700: "#185abc",
          DEFAULT: "var(--primary)",
          foreground: "#ffffff",
          light: "#8ab4f8",
        },
        secondary: {
          DEFAULT: "#f1f3f4", // Google Light Gray
          foreground: "#202124", // Google Dark Gray
        },
        accent: {
          DEFAULT: "#e8f0fe", // Google Blue 50
          foreground: "#1967d2", // Google Blue 700
        },
        border: "var(--card-border)",
        ring: "var(--ring)",
        danger: "#d93025",
        destructive: "#d93025",
      },
      boxShadow: {
        'soft': '0 2px 10px rgba(0, 0, 0, 0.03), 0 10px 25px rgba(0, 0, 0, 0.04)',
        'card': '0 0 0 1px rgba(0,0,0,0.03), 0 2px 8px rgba(0,0,0,0.04)',
        'card-hover': '0 0 0 1px rgba(0,0,0,0.03), 0 8px 16px rgba(0,0,0,0.06)',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-up': 'slideUp 0.5s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config
