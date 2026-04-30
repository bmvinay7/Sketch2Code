# Sketch2Code — Design System for Claude Code

This document describes the exact visual design language used in the Sketch2Code landing page. All pages of the actual platform (dashboard, upload flow, results page, etc.) must be migrated to match this aesthetic. Treat this as the single source of truth.

---

## 1. Overall Aesthetic Direction

**Theme:** Luxury editorial · Dark academic · Painterly atmospheric

The design evokes a late-night study room — deep navy skies, warm glowing light sources, and handcrafted serif typography. It feels like an old library met the cosmos. Every element has intentional restraint: no glowing neon, no gradient rave, no card shadows. The visual weight comes from **typography contrast**, **transparency layers**, and **the background illustration** doing the heavy lifting.

The mood: quiet, focused, brilliant. Not a hacker tool. Not a startup. An experience.

---

## 2. Color Palette

Use CSS variables throughout the entire codebase. Never hardcode these values.

```css
:root {
  /* Core backgrounds */
  --color-bg-base:        #08111f;   /* Deep navy — page background */
  --color-bg-card:        rgba(255, 255, 255, 0.04);  /* Glassmorphism card fill */
  --color-bg-card-hover:  rgba(255, 255, 255, 0.07);

  /* Borders */
  --color-border-card:    rgba(255, 255, 255, 0.14);  /* Subtle card outline */
  --color-border-nav:     rgba(255, 255, 255, 0.10);

  /* Text */
  --color-text-primary:   #FFFFFF;
  --color-text-secondary: rgba(255, 255, 255, 0.65);
  --color-text-muted:     rgba(255, 255, 255, 0.35);  /* Step numbers, meta */

  /* Accent — the italic teal highlight seen on "AI shortcut", "first", "always" */
  --color-accent:         #7DBDB0;   /* Muted seafoam teal */
  --color-accent-dim:     #5A9E94;

  /* Button */
  --color-btn-primary-bg:   rgba(255, 255, 255, 0.12);
  --color-btn-primary-border: rgba(255, 255, 255, 0.50);
  --color-btn-primary-text:   #FFFFFF;
}
```

**Rules:**
- Background is always very dark navy. Never use black (#000) or pure dark gray (#111).
- Cards are **glassmorphic** — semi-transparent fill + border, no drop shadows.
- The teal accent (`--color-accent`) is used ONLY for specific italic words in display headings to create the visual "weight contrast" effect. Never use it for backgrounds, borders, or body text.
- No gradients on UI elements. The gradient lives only in the background artwork.

---

## 3. Typography

### Font Families

```css
/* In your global CSS or next/font setup */
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,700;1,400;1,500&family=Inter:wght@300;400;500&display=swap');

:root {
  --font-display: 'Playfair Display', Georgia, serif;  /* All headings */
  --font-body:    'Inter', system-ui, sans-serif;       /* Body, UI labels */
}
```

> If Playfair Display is already installed via next/font, keep it. If not, add it. The key trait is: **classic serif with strong italic support**.

### Heading Scale

| Role | Size | Weight | Font | Notes |
|---|---|---|---|---|
| Hero H1 | `clamp(3rem, 6vw, 5.5rem)` | 400 | Display | Mixed color (see below) |
| Section H2 | `clamp(2rem, 4vw, 3.5rem)` | 400 | Display | Same mixed color pattern |
| Card Title | `1.5rem` | 400 | Display | Pure white |
| Body | `1rem–1.125rem` | 300–400 | Body | `--color-text-secondary` |
| Step Number | `1.5rem` | 300 | Body | `--color-text-muted` |
| Eyebrow / Tag | `0.75rem` | 400 | Body | Uppercase, letter-spacing: 0.2em |

### The "Mixed Accent" Heading Technique

This is the signature typographic move of the design. In large headings, certain words appear in `--color-accent` (teal) and italic to create visual contrast:

```jsx
// Pattern: normal white word + italic teal word + normal white word
<h1>
  The <em className="accent">AI shortcut</em> is quietly breaking how we learn to code.
</h1>

<h2>
  Draw <em className="accent">first.</em> Understand <em className="accent">always.</em>
</h2>
```

```css
.accent {
  color: var(--color-accent);
  font-style: italic;
  font-weight: 400;
}
```

Apply this pattern to ALL major section headings. Pick 1–2 words per heading to highlight. Never highlight more than ~30% of a heading.

### Eyebrow Tags

The "DRAW IT · LEARN IT · BUILD IT" style labels above hero sections:

```css
.eyebrow {
  font-family: var(--font-body);
  font-size: 0.75rem;
  font-weight: 400;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
  margin-bottom: 1.25rem;
}
```

Use `·` (centered dot U+00B7) as separator, with spaces on either side.

---

## 4. Background System

### Global Page Background

The background is a **single full-bleed atmospheric illustration** — a painterly night sky with students studying among towering books, warm candlelight, and flowers. It spans the full viewport height on the hero and fades/persists subtly on scroll.

**Implementation approach for the app (no illustration):**

Since the app pages don't have the illustration, simulate the atmosphere:

```css
body {
  background-color: var(--color-bg-base);
  background-image:
    radial-gradient(ellipse 80% 50% at 20% 10%, rgba(30, 60, 100, 0.4) 0%, transparent 60%),
    radial-gradient(ellipse 60% 40% at 80% 5%,  rgba(20, 50, 80, 0.3) 0%, transparent 50%),
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='400' height='400' filter='url(%23noise)' opacity='0.035'/%3E%3C/svg%3E");
  background-attachment: fixed;
  min-height: 100vh;
}
```

### Stars Effect (Optional, High Impact)

Add a very subtle star particle field using CSS if feasible:

```css
/* Tiny white dots scattered, very low opacity */
.stars-overlay {
  position: fixed;
  inset: 0;
  pointer-events: none;
  background-image:
    radial-gradient(1px 1px at 15% 20%, rgba(255,255,255,0.6) 0%, transparent 100%),
    radial-gradient(1px 1px at 45% 8%,  rgba(255,255,255,0.4) 0%, transparent 100%),
    radial-gradient(1.5px 1.5px at 72% 15%, rgba(255,255,255,0.7) 0%, transparent 100%),
    radial-gradient(1px 1px at 88% 30%, rgba(255,255,255,0.3) 0%, transparent 100%),
    radial-gradient(1px 1px at 30% 55%, rgba(255,255,255,0.25) 0%, transparent 100%),
    radial-gradient(1px 1px at 60% 70%, rgba(255,255,255,0.3) 0%, transparent 100%),
    radial-gradient(1.5px 1.5px at 10% 80%, rgba(255,255,255,0.5) 0%, transparent 100%);
  z-index: 0;
}
```

Or use a lightweight canvas/CSS star library. Keep stars at < 0.7 opacity. Never animate them (too distracting in the app).

---

## 5. Component Library

### 5.1 Navigation Bar

```
[Logo — Serif]          [Nav Links]          [CTA Button]
```

```css
nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 3rem;
  background: rgba(8, 17, 31, 0.6);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--color-border-nav);
}

.nav-logo {
  font-family: var(--font-display);
  font-size: 1.25rem;
  font-weight: 400;
  color: var(--color-text-primary);
  letter-spacing: -0.01em;
}

.nav-links {
  display: flex;
  gap: 2.5rem;
  list-style: none;
}

.nav-link {
  font-family: var(--font-body);
  font-size: 0.9rem;
  font-weight: 400;
  color: var(--color-text-secondary);
  text-decoration: none;
  transition: color 0.2s;
}

.nav-link:hover,
.nav-link.active {
  color: var(--color-text-primary);
}

/* Active dot indicator */
.nav-link.active::before {
  content: '● ';
  font-size: 0.5rem;
  vertical-align: middle;
  color: var(--color-text-primary);
}
```

### 5.2 Glassmorphic Cards

Used for problem/feature cards, step cards, info panels:

```css
.card {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border-card);
  border-radius: 16px;
  padding: 2rem 2.25rem;
  backdrop-filter: blur(8px);
  transition: background 0.25s ease, border-color 0.25s ease;
}

.card:hover {
  background: var(--color-bg-card-hover);
  border-color: rgba(255, 255, 255, 0.22);
}

.card-number {
  font-family: var(--font-body);
  font-size: 1.4rem;
  font-weight: 300;
  color: var(--color-text-muted);
  margin-bottom: 1.25rem;
  display: block;
}

.card-title {
  font-family: var(--font-display);
  font-size: 1.4rem;
  font-weight: 400;
  color: var(--color-text-primary);
  margin-bottom: 0.75rem;
}

.card-body {
  font-family: var(--font-body);
  font-size: 0.95rem;
  font-weight: 300;
  color: var(--color-text-secondary);
  line-height: 1.7;
}
```

**Two layout variants seen in screenshots:**

- **Grid cards** (problem section): 2-column CSS grid, equal height cards
- **List cards** (solution steps): Single full-width column, numbered 01 / 02 / 03... with title on right

```css
/* 2-col problem grid */
.card-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

/* Step list */
.step-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.step-card {
  display: grid;
  grid-template-columns: 80px 1fr;
  align-items: start;
  gap: 1.5rem;
}
```

### 5.3 Buttons

**Primary Button** (filled, pill-shaped):

```css
.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 2rem;
  background: rgba(255, 255, 255, 0.10);
  border: 1px solid rgba(255, 255, 255, 0.45);
  border-radius: 999px;
  color: var(--color-text-primary);
  font-family: var(--font-body);
  font-size: 0.95rem;
  font-weight: 400;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s;
  text-decoration: none;
  white-space: nowrap;
}

.btn-primary:hover {
  background: rgba(255, 255, 255, 0.18);
  border-color: rgba(255, 255, 255, 0.7);
}
```

**Ghost / Text Button** (inline link with arrow):

```css
.btn-ghost {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  color: var(--color-text-secondary);
  font-family: var(--font-body);
  font-size: 0.95rem;
  font-weight: 400;
  text-decoration: none;
  background: none;
  border: none;
  cursor: pointer;
  transition: color 0.2s;
}

.btn-ghost:hover {
  color: var(--color-text-primary);
}

/* Arrow: use → character or an SVG icon, never a library icon here */
.btn-ghost::after {
  content: '→';
}
```

### 5.4 Input Fields

For forms in the app (upload, prompts, settings):

```css
.input {
  width: 100%;
  padding: 0.875rem 1.25rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--color-border-card);
  border-radius: 10px;
  color: var(--color-text-primary);
  font-family: var(--font-body);
  font-size: 0.95rem;
  outline: none;
  transition: border-color 0.2s, background 0.2s;
}

.input::placeholder {
  color: var(--color-text-muted);
}

.input:focus {
  border-color: var(--color-accent);
  background: rgba(255, 255, 255, 0.08);
}
```

### 5.5 Badges / Tags

```css
.badge {
  display: inline-flex;
  align-items: center;
  padding: 0.3rem 0.75rem;
  background: rgba(125, 189, 176, 0.12);  /* accent color tinted */
  border: 1px solid rgba(125, 189, 176, 0.3);
  border-radius: 999px;
  color: var(--color-accent);
  font-family: var(--font-body);
  font-size: 0.75rem;
  font-weight: 400;
  letter-spacing: 0.05em;
}
```

### 5.6 Dividers / Section Separators

No visible horizontal rules. Use vertical spacing only (padding: 6rem 0 on sections). If a visual separator is absolutely needed:

```css
.section-divider {
  width: 60px;
  height: 1px;
  background: rgba(255, 255, 255, 0.15);
  margin: 3rem auto;
}
```

---

## 6. Layout & Spacing

### Page Structure

```
body
  └── <nav> (fixed, full-width)
  └── <main>
        └── <section> × N  (each section is full-width)
              └── .container (max-width wrapper, centered)
```

```css
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 3rem;
}

section {
  padding: 7rem 0;
  position: relative;
}
```

### Spacing Scale

Use a consistent 8px base unit. Prefer these values:

| Token | Value | Use |
|---|---|---|
| `--space-1` | 0.5rem (8px) | Tight gaps |
| `--space-2` | 1rem (16px) | Card inner gaps |
| `--space-3` | 1.5rem (24px) | Component breathing room |
| `--space-4` | 2rem (32px) | Card padding |
| `--space-6` | 3rem (48px) | Section sub-gaps |
| `--space-10` | 5rem (80px) | Between major blocks |
| `--space-14` | 7rem (112px) | Section vertical padding |

---

## 7. Motion & Transitions

Keep animations **subtle and purposeful**. This is a focused, academic aesthetic — not a flashy SaaS.

```css
/* Global transition defaults */
* {
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

/* Page/section entrance: fade up */
@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(24px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-in {
  animation: fadeUp 0.6s ease forwards;
}

/* Stagger children */
.stagger-children > *:nth-child(1) { animation-delay: 0.0s; }
.stagger-children > *:nth-child(2) { animation-delay: 0.1s; }
.stagger-children > *:nth-child(3) { animation-delay: 0.2s; }
.stagger-children > *:nth-child(4) { animation-delay: 0.3s; }
```

For Next.js, use Intersection Observer or Framer Motion `whileInView` for scroll-triggered reveals:

```jsx
// Framer Motion example
<motion.div
  initial={{ opacity: 0, y: 24 }}
  whileInView={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
  viewport={{ once: true, margin: '-80px' }}
>
  {children}
</motion.div>
```

**What NOT to do:**
- No scaling animations on cards
- No bounce/spring easing
- No parallax beyond very subtle (< 10% movement)
- No color-change animations except on hover
- No loading spinners — use skeleton loaders styled to match the dark theme

---

## 8. App-Specific Pages

Since the app (upload, results, dashboard) doesn't have the illustration, here's how to adapt the style:

### Upload / Input Page

- Full dark background with star overlay
- Center-aligned content
- Large serif heading: e.g., `Draw <em className="accent">something.</em>`
- Drag-and-drop zone styled as a glassmorphic card with dashed border:

```css
.dropzone {
  border: 2px dashed rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: 4rem;
  background: rgba(255, 255, 255, 0.03);
  text-align: center;
  transition: border-color 0.2s, background 0.2s;
  cursor: pointer;
}

.dropzone:hover,
.dropzone.active {
  border-color: var(--color-accent);
  background: rgba(125, 189, 176, 0.05);
}

.dropzone-icon {
  color: var(--color-text-muted);
  font-size: 3rem;
  margin-bottom: 1rem;
}
```

### Results / Code View Page

- 2-column layout: left = original sketch image, right = generated code
- Code block styling:

```css
.code-block {
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid var(--color-border-card);
  border-radius: 12px;
  padding: 1.5rem;
  font-family: 'Fira Code', 'Cascadia Code', monospace;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.85);
  overflow: auto;
  line-height: 1.65;
}
```

- Section headers for explanation blocks use the same serif mixed-accent pattern
- "Explanation" cards: same glassmorphic card component

### Dashboard / History Page

- Use the numbered card list style (01, 02, 03...) for recent conversions
- Grid for thumbnail previews: 3-column, glassmorphic cards
- Empty state: centered serif italic text in `--color-text-muted`

---

## 9. Quotes / Pull Quotes

Seen at the bottom of the problem section: *"Learning by doing" is being quietly replaced by "learning by copying."*

```css
.pull-quote {
  font-family: var(--font-display);
  font-style: italic;
  font-size: 1.2rem;
  font-weight: 400;
  color: var(--color-text-secondary);
  text-align: center;
  max-width: 680px;
  margin: 4rem auto 0;
  line-height: 1.6;
}
```

Use sparingly — maximum one per section, only for genuinely punchy lines.

---

## 10. Responsive Breakpoints

```css
/* Mobile: stack everything, reduce font sizes */
@media (max-width: 768px) {
  .container { padding: 0 1.25rem; }
  section { padding: 4rem 0; }
  .card-grid { grid-template-columns: 1fr; }
  .step-card { grid-template-columns: 50px 1fr; }
  nav { padding: 1rem 1.25rem; }
  .nav-links { display: none; } /* Use hamburger menu */
}

/* Tablet */
@media (max-width: 1024px) {
  .container { padding: 0 2rem; }
  .card-grid { grid-template-columns: 1fr 1fr; }
}
```

---

## 11. Icons

Use **Lucide React** for all icons. Keep them minimal:
- Size: 18–22px in body, 28–32px in empty states
- Color: `var(--color-text-secondary)` by default, `var(--color-accent)` for active/highlighted
- No icon backgrounds or containers — naked icons only
- No filled icons. Always use the stroke (outline) variant

---

## 12. What to Strictly Avoid

| ❌ Don't | ✅ Do Instead |
|---|---|
| Purple/violet gradients | Deep navy + subtle radial glows |
| White or light backgrounds | Dark navy base everywhere |
| Inter/Roboto for headings | Playfair Display (serif) |
| Neon glow effects | Subtle teal accent on text only |
| Heavy drop shadows | Glassmorphic borders only |
| Colored card backgrounds | Transparent fill + border |
| Rounded cards >20px radius | Max border-radius: 16px for cards |
| Multiple accent colors | One accent: `--color-accent` teal only |
| Emoji in UI | None |
| Loading spinners | Skeleton loaders in dark palette |
| Dense text walls | Short, punchy text with generous spacing |

---

## 13. Tailwind Config (if using Tailwind)

If the project uses Tailwind CSS, extend the config:

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        'bg-base':    '#08111f',
        'accent':     '#7DBDB0',
        'accent-dim': '#5A9E94',
        'text-secondary': 'rgba(255,255,255,0.65)',
        'text-muted': 'rgba(255,255,255,0.35)',
        'card-border': 'rgba(255,255,255,0.14)',
      },
      fontFamily: {
        display: ['Playfair Display', 'Georgia', 'serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'card': '16px',
        'btn': '999px',
      },
      backdropBlur: {
        'card': '8px',
        'nav': '12px',
      },
    },
  },
}
```

---

## 14. Reference Checklist for Claude Code

Before submitting any page migration, verify:

- [ ] Background is dark navy (`#08111f`), not black or gray
- [ ] All headings use Playfair Display (serif)
- [ ] At least one heading has the italic teal accent word pattern
- [ ] Cards are glassmorphic (transparent bg + subtle border, no shadow)
- [ ] Buttons are pill-shaped with semi-transparent fill + white border
- [ ] No hardcoded color values — only CSS variables
- [ ] Spacing uses the 8px scale consistently
- [ ] Motion is subtle: fade-up on enter, 0.6s duration max
- [ ] Icons are Lucide, stroke only, no backgrounds
- [ ] Pull quote (if present) is italic serif, centered, muted color
- [ ] No purple, no neon, no white backgrounds anywhere in the app

---

*This design.md is authoritative. When in doubt, refer to the screenshots and this document, not to general design conventions.*