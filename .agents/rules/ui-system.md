---
trigger: model_decision
---

# UI System

Defines the project's premium UI/UX standards, typography, and animation tokens. Apply this rule when styling components, implementing animations, or reviewing the visual fidelity of the interface.

## Intent

Maintain a high-fidelity, premium, and performant user interface that feels organic and state-of-the-art.

## Rules

- MUST use the **BEM** (Block Element Modifier) naming convention for all CSS classes.
- MUST use CSS variables for all design tokens (colors, spacing, etc.).
- MUST use **GSAP** for complex and fluid animations (avoid instant CSS snaps).
- MUST prioritize visual excellence: use smooth gradients, modern typography, and subtle micro-animations.

## Guidelines

- **Typography**:
  - Main: `Geist` and `Geist Mono` at thin weights (e.g., 200) with tight letter spacing (0.34%).
  - Custom: `Geist Pixel` (from Google Fonts) for specific creative elements.
  - Use `font--mono-label` class for monospace labels.
- **Colors**: Use the curated palette in `_colors.css`.
  - Surface: `var(--color-bg)`, `var(--color-primary)`
  - Content: `var(--color-text)`, `var(--color-text-muted)`, `var(--color-text-inv)`
  - Overlays: `var(--color-overlay-xx)` (from 02 to 60) for depth and glassmorphism.
- **Layout**:
  - Max Width: `1920px` (`--container-max-width`)
  - Standard Width: `96.4%` (`--container-width`)
  - Main container class: `.section-container`
  - Stage scaling: responsive via `--page-stage-scale`, `--page-stage-width`, `--page-stage-height`, `--page-stage-offset-x` CSS custom properties set by `stageScale.ts`.
- **Transitions**: State changes (theme toggles, overlays) MUST use fluid GSAP motion.
- **Grid**: 12-column grid layout using `grid-template-columns: repeat(12, 1fr)`.
- **Shader layouts**: Two layout modes — `layered` (3D Threlte scene) and `shader` (WebGL background via gem-smoke shader), controlled by `uiState.layoutMode`.

## Stacking Context

- Shader canvas: `z-index: -50`
- Grid background: `z-index: -1`
- Page stage: `z-index: 2`
- Hero section: `z-index: 10000`
- Mobile blocker: `z-index: 9999`

## Anti-patterns

- Hardcoding hex codes instead of using established CSS variables.
- Using plain browser defaults or generic "red/blue" colors.
- Instant visibility toggles without transitional animations.
- Ignoring the `data-theme` logic for light/dark mode variations.
