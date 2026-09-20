---
trigger: always_on
---

# Architecture — Ego Ipse

## Stack

- **Monorepo**: Turborepo + Bun
- **Frontend**: SvelteKit (Svelte 5, Runes)
- **3D**: Threlte / Three.js + `@paper-design/shaders` + custom GLSL
- **CMS**: Sanity (`apps/studio`)
- **Motion**: GSAP
- **UI**: BEM CSS (Tailwind v4 as foundation layer, rarely used directly), Geist typography
- **Deploy**: Cloudflare Pages (adapter-cloudflare + wrangler)

## Project Tree

```
apps/web/               # SvelteKit + Threlte frontend
  src/lib/assets/       # Fonts, images, SVGs
  src/lib/components/   # Feature-based components (Header/, Info/, Poster/, Shaders/)
  src/lib/layouts/      # Page-level layout components
  src/lib/shaders/      # GLSL modules (gem-smoke, preview-reveal*)
  src/lib/state/        # Svelte 5 runes ($state)
  src/lib/types/        # TS types (mirror Sanity schemas)
  src/lib/utils/        # Utilities (glitch, splitText, stageScale, tiles)
  src/lib/styles/       # Design tokens — base/, layout/, utilities/
  src/routes/           # SvelteKit routing (+ api/, shaders/)
apps/studio/            # Sanity CMS (schemaTypes/)
packages/eslint/ packages/stylelint/ packages/tsconfig/  # Shared configs
```

## Rules

- MUST follow the tree above. No apps/packages outside it.
- MUST use feature-based subdirectories within `lib/components/` for component grouping.
- MUST NOT import across feature groups directly — use a public API or bridge.
- MUST isolate business logic/state from UI components.
- MUST NOT hardcode content that belongs in Sanity.
- MUST keep Sanity schemas ↔ GROQ queries ↔ `$lib/types/` in sync.

## Related Skills

| Area                    | Skill         |
| ----------------------- | ------------- |
| UI components + styling | Load `style`  |
| Committing changes      | Load `commit` |
| Pull requests           | Load `pr`     |
