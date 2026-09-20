---
name: style
description: Style UI with BEM, tokens, and motion. Use when styling components, mapping classes, or animating with GSAP.
---

# Style Skill

This skill ensures that all UI implementations adhere to the project's premium aesthetic and technical standards.

## When to use this skill

- Use this when building new Svelte components that require styling.
- Use this when implementing complex animations using GSAP.
- Use this when mapping CSS classes to the BEM (Block Element Modifier) convention.

## How to use it

### Tokens

Always refer to the existing design system in `apps/web/src/styles`:

- **Colors (`_colors.css`)**: Use `var(--color-bg)`, `var(--color-text)`, and `var(--color-primary)`. Use `--color-overlay-xx` for depth.
- **Typography (`_typography.css`)**: Use `Geist`, `Geist Mono`, and `Geist Pixel` (200 weight, 0.34% tracking).
- **Layout (`_containers.css`)**: Wrap hero and section content in `.section-container` (max-width 1920px).
- **Sizing**: Use `rem` for font sizes, spacing, and layout dimensions. Use `px` only for fine details (borders, shadows, precise positioning).

## Examples

```svelte
<!-- Good: BEM + Tokens + rem -->
<section class="hero section-container">
  <h1 class="hero__title">Ego Ipse</h1>
</section>

<style>
  .hero__title {
    color: var(--color-text);
    font-family: 'Geist', sans-serif;
    font-weight: 200;
    font-size: 3rem;
    letter-spacing: 0.34%;
  }
</style>
```
