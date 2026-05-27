import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          0: "var(--ink-0)",      // deepest — base canvas
          50: "var(--ink-50)",    // surface
          100: "var(--ink-100)",  // surface raised
          200: "var(--ink-200)",  // hover
          300: "var(--ink-300)"   // active
        },
        rule: "var(--rule)",         // hairline divider
        "rule-strong": "var(--rule-strong)",
        paper: {
          50: "var(--paper-50)",     // primary text
          100: "var(--paper-100)",   // secondary text
          200: "var(--paper-200)",   // muted text
          300: "var(--paper-300)"    // hint text
        },
        graphite: "var(--graphite)", // disabled / scaffolding
        lime: "var(--lime)",         // the one accent
        "lime-dim": "var(--lime-dim)",
        amber: "var(--amber)",       // annotation pencil
        crimson: "var(--crimson)",   // destructive
        moss: "var(--moss)",         // success
        // legacy aliases (kept so existing classes don't break)
        background: "var(--ink-0)",
        surface: "var(--ink-50)",
        "surface-raised": "var(--ink-100)",
        border: "var(--rule)",
        primary: "var(--lime)",
        accent: "var(--lime)",
        "text-primary": "var(--paper-50)",
        "text-secondary": "var(--paper-100)",
        "text-muted": "var(--paper-200)",
        "border-nav": "var(--rule)",
        success: "var(--moss)",
        warning: "var(--amber)",
        error: "var(--crimson)"
      },
      fontFamily: {
        display: ["var(--font-mono)", "JetBrains Mono", "ui-monospace", "monospace"],
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "ui-monospace", "monospace"],
        body: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      letterSpacing: {
        tightest: "-0.045em",
        cap: "0.18em"
      },
      borderRadius: {
        none: "0",
        sm: "2px",
        md: "4px",
        lg: "6px",
        card: "0"
      },
      boxShadow: {
        hairline: "0 0 0 1px var(--rule)",
        "hairline-strong": "0 0 0 1px var(--rule-strong)",
        lime: "0 0 0 1px var(--lime)"
      }
    }
  },
  plugins: []
};

export default config;
