# Ego Ipse

Portfolio + identity platform. Organic, interactive, high-fidelity over generic. Stack: Bun, Turborepo, SvelteKit 5, Threlte/Three.js + `@paper-design/shaders` + GLSL, Sanity, GSAP, BEM CSS, Cloudflare Pages.

## Structure

- `apps/web` — SvelteKit frontend: `lib/assets/`, `lib/components/` (feature-grouped: Header/, Info/, Poster/, Shaders/), `lib/layouts/`, `lib/shaders/` (gem-smoke, preview-reveal), `lib/state/` (`$state` runes), `lib/types/` (mirror Sanity), `lib/utils/`, `lib/styles/` (tokens: base/, layout/, utilities/), `routes/` (+ `api/`, `shaders/`). Deploys to Cloudflare Pages.
- `apps/studio` — Sanity Studio (`schemaTypes/`).
- `packages/eslint|stylelint|tsconfig` — shared configs. Changes in `packages/` affect the monorepo.
- No new top-level `apps/`/`packages/`. Changes live under `apps/` + `packages/`.

## Rules

- Root-cause fixes, modularity, KISS + DRY. Remove dead code on sight. Lowercase comments.
- No `any` (`no-explicit-any`: error). Strict TS + `noUncheckedIndexedAccess`. Resolve all LSP diagnostics before committing.
- Svelte 5 Runes (`$state`, `$derived`, `$effect`, `$props`) only, never stores. Logic/state in runes or utils, not components. `each` blocks need unique keys. `routes/api/` stays thin (fetch/serve).
- Feature subdirs under `lib/components/`. No direct cross-feature imports — public API or bridge.
- No hardcoded Sanity content. Keep schemas ↔ GROQ (`+page.server.ts`) ↔ `$lib/types/` in sync.
- Validate: `bun run check && bun run build`. `bun run format` auto-fixes. ESLint + Stylelint + Prettier; Stylelint: BEM patterns, alphabetical props, string imports.
- Tests: Vitest + `vitest-browser-svelte` (Playwright). Colocated: `*.svelte.{test,spec}.{js,ts}` for components, `.{test,spec}.{js,ts}` for Node logic.
- Git (PowerShell only): commit only when explicitly instructed. Never stage `.agents/`.

## UI — when styling or animating

- BEM classes, CSS vars for tokens, `rem` for type/spacing/layout (`px` only for borders, shadows, 1-off positioning). GSAP for complex/fluid motion, never instant snaps for state changes (theme, overlays).
- Type: `Geist` / `Geist Mono` / `Geist Pixel`, thin (~200), 0.34% tracking; `font--mono-label` for mono labels.
- Color vars in `_colors.css`: surface `(--color-bg, --color-primary)`, content `(--color-text, --color-text-muted, --color-text-inv)`, overlays `--color-overlay-xx` (02–60). No hardcoded hex, no browser-default red/blue. Respect `data-theme`.
- Tailwind v4 is foundation only (`@import 'tailwindcss'` in `main.css`); write hand-rolled BEM with tokens from `_colors.css`, `_typography.css`, `_containers.css`.
- Layout: max `1920px` (`--container-max-width`), width `96.4%` (`--container-width`), `.section-container`; stage scaling via `--page-stage-*` from `stageScale.ts`. 12-col grid (`repeat(12, 1fr)`).
- Shaders: `layered` (Threlte 3D) vs `shader` (gem-smoke WebGL bg) via `uiState.layoutMode`, theme-reactive via `data-theme`. Z-index: canvas `-50`, grid `-1`, stage `2`, mobile blocker `9999`, hero `10000`.

## Skills (`.agents/skills/`)

| Skill      | Use when                            |
| ---------- | ----------------------------------- |
| `style`    | Styling components, BEM, GSAP       |
| `webp`     | Work preview images                 |
| `commit`   | Staging + committing                |
| `pr`       | PRs with structured descriptions    |
| `grill-me` | Stress-testing a plan or design     |

Bar: if a change hurts visual fidelity or organic motion, reconsider it. Performance never at the expense of required high-fidelity animation.
