---
trigger: always_on
---

# Project Context — Ego Ipse

## What

Premium, high-fidelity personal portfolio + identity platform. Organic, interactive web experience — visual excellence, fluid motion, and a technical design language over generic aesthetics.

## The System

- **Apps**:
  - `apps/web` — SvelteKit + Threlte (Three.js) frontend. WebGL shader layouts via `@paper-design/shaders` + custom GLSL. Deploys to Cloudflare Pages.
  - `apps/studio` — Sanity Studio for content management.
- **Packages**: shared ESLint, Stylelint, and TypeScript configs.
- **Infra**: Turborepo + Bun.
- **Testing**: Vitest with Playwright browser provider (unit + component).

## Premium Bar

Every technical decision must support the premium feel. If a change compromises visual fidelity or organic motion, reconsider it. Performance matters, never at the expense of necessary high-fidelity animation (GSAP, Threlte, WebGL shaders).

## Awareness

- Changes in `packages/` affect the whole monorepo.
- Keep Sanity schemas in sync with SvelteKit data fetching.
- Thin Geist aesthetic (200 weight, 0.34% tracking) across all new UI.
- Shader layouts (gem-smoke, preview-reveal) stay theme-reactive via `data-theme`.
- `$state` runes for reactive state, not Svelte stores.

## Related Skills

| Area                | Skill         |
| ------------------- | ------------- |
| UI implementation   | Load `style`  |
| Work preview images | Load `webp`   |
| Committing          | Load `commit` |
| Creating PRs        | Load `pr`     |
