# Design System — Playful-Professional Modern UI

> Apply this design language consistently across **every component, page, and screen** in the project.
> This document is the single source of truth for visual style.

---

## 1. Philosophy & Aesthetic Direction

The UI is **clean, open, and confidently minimal** with carefully placed moments of playfulness. Think of it as a whiteboard that got really good at typography — generous air, strong hierarchy, and a few deliberate pops of colour that feel hand-placed, not generated. Every screen should feel like it could be a product marketing page: structured yet alive.

**Core tension to preserve:** restraint in the layout, expressiveness in the accents.

---

## 2. Color Palette

Define these as CSS custom properties (or design tokens) and use *only* these across the entire project.

```css
:root {
  /* Base */
  --color-bg:          #F5F5F5;   /* off-white page background */
  --color-surface:     #FFFFFF;   /* cards, modals, panels */
  --color-border:      #E2E2E2;   /* subtle dividers and outlines */

  /* Text */
  --color-text-primary:   #0D0D0D;  /* headlines, body */
  --color-text-secondary: #6B6B6B;  /* captions, meta, placeholders */
  --color-text-on-dark:   #FFFFFF;  /* text on dark/filled surfaces */

  /* Brand accent (electric blue) */
  --color-accent:         #1971FF;  /* primary CTA, highlighted words, links */
  --color-accent-hover:   #0050D8;

  /* Decorative pops — used ONLY on floating shape elements */
  --color-pop-lavender:   #C084E0;  /* e.g. floating square */
  --color-pop-yellow:     #F5C518;  /* e.g. floating circle */
  --color-pop-coral:      #FF6B6B;  /* optional third pop */

  /* Dark surface (active states, inverted cards) */
  --color-dark-surface:   #111111;
  --color-dark-border:    #2A2A2A;
}
```

**Rules:**
- `--color-accent` is the ONLY blue used — never tint it for decorative purposes.
- Decorative pops (`--color-pop-*`) never appear on interactive elements (buttons, links, inputs). They are purely illustrative floaters.
- Dark surfaces are used for **active/selected** card states and full-bleed dark sections only.

---

## 3. Typography

### Font Stack
```css
/* Display / Headlines */
font-family: 'Syne', 'DM Sans', sans-serif;   /* bold, geometric, modern */

/* Body / UI text */
font-family: 'DM Sans', 'Outfit', sans-serif;

/* Monospace (code, labels, badges) */
font-family: 'JetBrains Mono', 'IBM Plex Mono', monospace;
```

Load from Google Fonts: `Syne:wght@700;800` + `DM Sans:wght@400;500;600`.

### Scale

| Token            | Size       | Weight | Usage                              |
|------------------|------------|--------|------------------------------------|
| `--text-hero`    | 64–80px    | 800    | Page hero headline                 |
| `--text-h1`      | 40–48px    | 700    | Section titles                     |
| `--text-h2`      | 28–32px    | 700    | Card titles, modal headers         |
| `--text-h3`      | 20–22px    | 600    | Sub-section labels                 |
| `--text-body`    | 16px       | 400    | Paragraphs, descriptions           |
| `--text-small`   | 13–14px    | 500    | Meta, timestamps, captions         |
| `--text-label`   | 12px       | 600    | Badges, tab labels (uppercase)     |

### Typography Rules
- **Hero text**: Mix weights within one headline — a coloured segment (`--color-accent`) uses the same weight as the dark text beside it. Never italicise for emphasis; use colour or weight instead.
- **Line height**: `1.15` for headlines, `1.6` for body text.
- **Letter spacing**: `-0.02em` on display text, `0.06em` on all-caps labels.
- **Max line width**: `65ch` for body paragraphs.

---

## 4. Background & Texture

Every page background uses a **dot grid** texture over the base colour:

```css
body {
  background-color: var(--color-bg);
  background-image: radial-gradient(circle, #CCCCCC 1px, transparent 1px);
  background-size: 20px 20px;
}
```

- Dot colour: `#CCCCCC` at full opacity on light bg; `#2A2A2A` on dark sections.
- Grid size: `20px × 20px` — never change this; it's a system constant.
- Cards and panels sit **on top** of this texture with a solid white/dark fill, creating natural depth without shadows.

---

## 5. Floating Decorative Shapes

Specific pages (heroes, empty states, onboarding) include **2–4 free-floating geometric shapes** as background decoration. These are:

- Simple primitives: squares (slightly rotated 5–15°), circles, rounded rectangles.
- Filled with `--color-pop-*` values, **no border, no shadow**.
- Positioned absolutely/freely — not on a grid. They overlap with content slightly but never obscure readable text.
- Size range: `60px – 120px`.
- Never animated (static decoration only).
- **One shape per colour maximum per view.**

```html
<!-- Example markup pattern -->
<div class="shape shape--square" style="--pop: var(--color-pop-lavender); top: 18%; left: 12%; rotate: -10deg;"></div>
<div class="shape shape--circle" style="--pop: var(--color-pop-yellow); top: 30%; right: 8%;"></div>
```

```css
.shape {
  position: absolute;
  background-color: var(--pop);
  pointer-events: none;
  z-index: 0;
}
.shape--square { width: 80px; height: 80px; border-radius: 12px; }
.shape--circle { width: 90px; height: 90px; border-radius: 50%; }
```

---

## 6. Layout & Spacing

### Grid
- Max content width: `1100px`, centred with `auto` margins.
- Horizontal padding: `clamp(24px, 5vw, 80px)`.
- Vertical section rhythm: `80–120px` between major sections.

### Spacing Scale (4px base)
```
4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 80 / 120px
```
Never use arbitrary values outside this scale.

### Composition Rules
- **Generous negative space** — content should never feel cramped.
- Decorative shapes sit at `z-index: 0`; content at `z-index: 1`.
- Avoid symmetrical two-column layouts in heroes — favour a single centred column with asymmetric decoration.

---

## 7. Components

Every component inherits the tokens above. Below are the standard patterns.

---

### 7.1 Navigation Bar

```
[ Logo ]  [ Nav Link ]  [ Nav Link ▾ ]  ...          [ Primary CTA ]  [ Ghost CTA ]
```

- Background: `var(--color-surface)` with `border-bottom: 1px solid var(--color-border)`.
- Height: `60px`.
- Logo: monochrome (black or white depending on theme).
- Nav links: `var(--color-text-primary)`, `font-weight: 500`, no underline, `opacity: 0.7` on non-hover.
- Dropdowns: white card with `border: 1px solid var(--color-border)`, `border-radius: 12px`.
- Sticky on scroll, no background blur.

---

### 7.2 Buttons

**Primary (filled)**
```css
background: var(--color-accent);
color: var(--color-text-on-dark);
border-radius: 999px;          /* full pill */
padding: 12px 28px;
font-weight: 600;
font-size: 15px;
border: none;
transition: background 0.15s ease, transform 0.1s ease;
```
Hover: `--color-accent-hover`, `transform: translateY(-1px)`.

**Ghost / Outlined**
```css
background: transparent;
color: var(--color-text-primary);
border: 1.5px solid var(--color-border);
border-radius: 999px;
padding: 11px 22px;
font-weight: 500;
```
Hover: `border-color: var(--color-text-primary)`, slight `background: rgba(0,0,0,0.03)`.

**Dark Filled**
Same shape as primary but `background: var(--color-dark-surface)`, `color: white`. Used for secondary emphasis (e.g. "Stars on GitHub").

**Icon Button**
```css
width: 36px; height: 36px;
border-radius: 8px;
background: transparent;
border: 1px solid var(--color-border);
```
Hover: `background: var(--color-bg)`.

**Rules:**
- Never use square buttons. Minimum border-radius is `8px`, pill shape preferred for CTAs.
- Button text is sentence case, never all-caps.
- Only one Primary button per viewport.

---

### 7.3 Cards

**Standard Card**
```css
background: var(--color-surface);
border: 1px solid var(--color-border);
border-radius: 16px;
padding: 24px;
box-shadow: none;   /* no shadow — border provides edge definition */
```

**Active / Selected Card**
```css
background: var(--color-dark-surface);
color: var(--color-text-on-dark);
border-color: var(--color-dark-surface);
```

**Hover state on interactive cards:**
```css
border-color: #BBBBBB;
transform: translateY(-2px);
transition: all 0.15s ease;
```

Card content hierarchy: `h3` (title) → body text → optional footer/action. No card should contain more than 3 levels of hierarchy.

---

### 7.4 Tab / Category Switcher

Horizontal scrollable row of tab pills:
```css
/* Container */
display: flex; gap: 8px; overflow-x: auto;

/* Inactive tab */
background: var(--color-surface);
border: 1px solid var(--color-border);
border-radius: 12px;
padding: 10px 18px;
font-size: 14px; font-weight: 500;
color: var(--color-text-secondary);

/* Active tab */
background: var(--color-dark-surface);
color: var(--color-text-on-dark);
border-color: transparent;
```

---

### 7.5 Badges & Labels

Outlined pill badge (e.g. "Local-First", feature tags):
```css
display: inline-flex;
border: 1.5px solid var(--color-text-primary);
border-radius: 999px;
padding: 5px 14px;
font-family: var(--font-mono);
font-size: 13px;
font-weight: 500;
background: transparent;
color: var(--color-text-primary);
```

Status/colour badges (success, warning, etc.): use subtle `background-color` at 10% opacity of the badge colour, with matching text colour. Always pill-shaped.

---

### 7.6 Inputs & Forms

```css
/* Text input */
background: var(--color-surface);
border: 1.5px solid var(--color-border);
border-radius: 10px;
padding: 12px 16px;
font-size: 15px;
color: var(--color-text-primary);
outline: none;

/* Focus */
border-color: var(--color-accent);
box-shadow: 0 0 0 3px rgba(25, 113, 255, 0.12);
```

Labels: `font-size: 13px; font-weight: 600; color: var(--color-text-secondary); margin-bottom: 6px;`

Never use floating labels. Label is always above the input.

---

### 7.7 Modal / Dialog

```css
background: var(--color-surface);
border: 1px solid var(--color-border);
border-radius: 20px;
padding: 32px;
max-width: 480px;
box-shadow: 0 24px 60px rgba(0,0,0,0.10);
```

Backdrop: `background: rgba(0,0,0,0.25)` — no blur.

---

### 7.8 Toolbar / Action Bar (bottom or inline)

```css
background: var(--color-surface);
border: 1px solid var(--color-border);
border-radius: 12px;
padding: 8px 16px;
display: flex; align-items: center; gap: 12px;
```

Icon size: `18px`. Dividers between groups: `1px solid var(--color-border)`, `height: 20px`.

---

### 7.9 Hero Section

Structure:
```
[Optional: floating shapes behind]
[Optional: badge/label pill above headline]
[Hero headline — large, mixed colour]
[Subheading — body size, secondary colour, max 1–2 lines]
[Primary CTA button]
```

Hero headline pattern — colour the **first 2–3 words** in `--color-accent`, rest in `--color-text-primary`:
```html
<h1>
  <span style="color: var(--color-accent)">Think big,</span> draw free —<br>
  ideas flow endlessly
</h1>
```

---

### 7.10 Empty States & Illustrations

Use a single centred floating shape (the largest allowed, up to `160px`) with a short label below. No third-party illustration libraries. All visuals are pure CSS/SVG geometric primitives.

---

## 8. Iconography

- Use **Lucide Icons** (outline style, `stroke-width: 1.5`).
- Icon size: `16px` inline, `20px` in buttons, `24px` standalone.
- Icons are always `var(--color-text-secondary)` unless part of an active/accent state.
- Never fill icons; outline only.

---

## 9. Motion & Animation

- **Page load**: staggered fade-up on hero elements (`opacity: 0 → 1`, `translateY: 16px → 0`), 60ms delay between items.
- **Hover**: `transition: all 0.15s ease` on interactive elements. Keep it snappy.
- **No bouncing, elastic, or spring animations** — easing is always `ease` or `ease-out`.
- Decorative shapes: **no animation** (static only).
- Avoid animations on elements the user didn't interact with after initial load.

```css
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}
```

---

## 10. Dark Mode

When dark mode is active (`.dark` class on `<html>` or `prefers-color-scheme: dark`):

```css
:root.dark {
  --color-bg:           #111111;
  --color-surface:      #1A1A1A;
  --color-border:       #2C2C2C;
  --color-text-primary: #F0F0F0;
  --color-text-secondary:#888888;
  --color-dark-surface: #FFFFFF;   /* inverts: active card is now white */
  /* accent stays the same */
}
```

Dot grid colour in dark mode: `#2A2A2A`.
Decorative pop colours lighten by `15%` in dark mode to maintain contrast.

---

## 11. Do's and Don'ts

| ✅ Do | ❌ Don't |
|---|---|
| Use pill-shaped buttons for all primary CTAs | Use rectangle/square buttons for CTAs |
| Use dot grid as page background texture | Use solid plain backgrounds |
| Let floating shapes bleed near content | Confine shapes strictly to margins |
| Mix font weights dramatically in headlines | Use one weight throughout a headline |
| Use `--color-accent` only for interactive/brand moments | Scatter blue everywhere decoratively |
| Rely on borders for card depth | Add `box-shadow` to every card |
| Use monospace font for code, labels, badges | Use monospace for body text |
| Keep the palette tight — 2 colours max per component | Introduce new colours per component |
| Use Lucide outline icons | Use filled or mixed icon styles |
| Write button text in sentence case | Write buttons in ALL CAPS |

---

## 12. Quick-Reference Checklist for New Components

Before shipping any new component, verify:

- [ ] Background texture present on outermost page wrapper
- [ ] All colours from token set only
- [ ] No `box-shadow` on cards (border only)
- [ ] Buttons are pill-shaped
- [ ] Typography uses Syne (display) + DM Sans (body)
- [ ] Icons are Lucide outline, `stroke-width: 1.5`
- [ ] Hover states have `transition: all 0.15s ease`
- [ ] Active/selected states use dark surface inversion
- [ ] Floating shapes (if any) use only `--color-pop-*` values
- [ ] Dark mode tokens applied