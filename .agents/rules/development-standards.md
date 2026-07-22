---
trigger: always_on
---

# Development Standards

## Intent

Maintain a high-fidelity, premium, and performant coding standard that prioritizes visual excellence and technical precision.

## Personality

- **Technical & Direct**: Use precise technical language. Avoid fluff.
- **Organic & Premium**: Prioritize fluid animations and high-fidelity UI.
- **Efficient**: Follow KISS (Keep It Simple, Stupid) and DRY (Don't Repeat Yourself).

## Decision Making

- MUST prioritize "User Experience" (UX) and "Visual Fidelity" in every UI change.
- MUST favor modularity over monolithic blocks of code.
- MUST solve the root cause rather than applying "hacky" fixes.
- MUST NOT make assumptions about user intent; ask for clarification.

## Architecture Standards

- MUST follow the feature-based isolation principle (feature subdirectories under `lib/components/`).
- MUST isolate business logic/state from UI components.
- MUST use shared configurations from `packages/` for consistency.
- MUST use Svelte 5 `$state` runes for reactive state (not stores).

## Rules

- MUST use Svelte v5 (Runes) and Threlte/Three.js for 3D interactions.
- MUST use BEM naming convention for all CSS; Tailwind utilities are configured but the project styles with hand-written BEM classes.
- MUST remove unnecessary code on sight.
- MUST ensure all `each` blocks have a unique key.
- MUST resolve all LSP diagnostics.
- MUST use lowercase for comments.

## Linting & Formatting

- **ESLint**:
  - MUST NOT use `any` types (`@typescript-eslint/no-explicit-any`: error).
  - MUST NOT use undeclared variables (`no-undef`: error).
  - MUST avoid navigation links without `resolve()` in Svelte (`svelte/no-navigation-without-resolve`: error).
  - MUST avoid undeclared environment variables in Turbo (`turbo/no-undeclared-env-vars`: warn).
- **Stylelint**:
  - MUST follow BEM for class and ID patterns.
  - MUST maintain alphabetical order for CSS properties (`order/properties-alphabetical-order`: true).
  - MUST use string notation for imports.
- **TypeScript**:
  - MUST enable `strict` mode logic.
  - MUST use `noUncheckedIndexedAccess` for safer array/object indexing.

## Guidelines

- Font: Geist (Thin weights, tight letter-spacing), Geist Mono, Geist Pixel (Google Fonts).
- Animation: GSAP for all state transitions (no instant snaps).
- Colors: Use variables from `_colors.css` only.
- Styling: Custom BEM classes in `<style>` blocks; Tailwind v4 is imported as a CSS foundation layer (normalize/reset) but utility classes are rarely used.
- Analytics: OpenPanel via `$lib/analytics/`.
- Shaders: `@paper-design/shaders` package + custom GLSL under `$lib/shaders/`.
- Stage scaling: Use `stageScale.ts` utilities for responsive stage sizing.
- Deploy: Cloudflare Pages via wrangler (`adapter-cloudflare`).

## Anti-patterns

- Bloated logic or repetitive code blocks.
- Shared global state without clear boundaries.
- Hardcoding hex colors or pixel values that should be variables.
- Using Svelte stores (`writable`, etc.) when `$state` runes should be used.
- Relying on Tailwind utility classes instead of BEM + design token CSS variables.
