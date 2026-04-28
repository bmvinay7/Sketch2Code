import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        surface: "var(--surface)",
        "surface-raised": "var(--surface-raised)",
        border: "var(--border)",
        primary: "var(--primary)",
        accent: "var(--accent)",
        success: "var(--success)",
        warning: "var(--warning)",
        error: "var(--error)",
        "text-primary": "var(--text-primary)",
        "text-secondary": "var(--text-secondary)",
        "text-muted": "var(--text-muted)"
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "sans-serif"],
        mono: ["var(--font-jetbrains)", "JetBrains Mono", "monospace"]
      },
      boxShadow: {
        glow: "0 0 36px rgba(34, 211, 238, 0.16)",
        indigo: "0 0 40px rgba(99, 102, 241, 0.18)"
      }
    }
  },
  plugins: []
};

export default config;
