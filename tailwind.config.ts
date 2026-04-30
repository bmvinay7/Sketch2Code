import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        'bg-base':    'var(--color-bg-base)',
        'bg-card':    'var(--color-bg-card)',
        'bg-card-hover': 'var(--color-bg-card-hover)',
        'accent':     'var(--color-accent)',
        'accent-dim': 'var(--color-accent-dim)',
        'text-primary': 'var(--color-text-primary)',
        'text-secondary': 'var(--color-text-secondary)',
        'text-muted': 'var(--color-text-muted)',
        'card-border': 'var(--color-border-card)',
        'border-nav': 'var(--color-border-nav)',
        background: "var(--background)",
        surface: "var(--surface)",
        "surface-raised": "var(--surface-raised)",
        border: "var(--border)",
        primary: "var(--primary)",
        success: "var(--success)",
        warning: "var(--warning)",
        error: "var(--error)"
      },
      fontFamily: {
        display: ['Playfair Display', 'Georgia', 'serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        sans: ["var(--font-inter)", "Inter", "sans-serif"],
        mono: ["var(--font-jetbrains)", "JetBrains Mono", "monospace"]
      },
      borderRadius: {
        'card': '16px',
        'btn': '999px',
      },
      backdropBlur: {
        'card': '8px',
        'nav': '12px',
      },
      boxShadow: {
        glow: "0 0 36px rgba(125, 189, 176, 0.16)",
        indigo: "0 0 40px rgba(125, 189, 176, 0.18)"
      }
    }
  },
  plugins: []
};

export default config;
