---
trigger: always_on
---

# Development Standards

## Intent

Maintain a clean, premium, high-fidelity codebase — visual excellence and technical precision over shortcuts.

## General

- Favor modularity. Solve root causes, not symptoms.
- Remove dead code on sight.
- Resolve all LSP diagnostics before committing.
- No `any` types (`@typescript-eslint/no-explicit-any`: error).
- TypeScript strict mode + `noUncheckedIndexedAccess`.
- Lowercase comments. KISS + DRY.

## SvelteKit

- Use Svelte 5 Runes (`$state`, `$derived`, `$effect`, `$props`) — never Svelte stores.
- Feature-based isolation: subdirectories under `lib/components/`.
- Isolate business logic/state from UI components — logic lives in `$state` runes or utils, not components.
- `each` blocks need unique keys.
- API routes in `routes/api/` are thin — fetch/serve, return result.

## Sanity CMS (`apps/studio`)

- Schemas in `apps/studio/schemaTypes/` define the content model.
- SvelteKit fetches via GROQ in `+page.server.ts`.
- Types in `$lib/types/` mirror the Sanity structures.
- Keep all three in sync.

## UI (when applicable)

- Follow `.agents/rules/ui-system.md` for all styling, typography, animation, and sizing conventions.

## Linting & Formatting

- ESLint + Stylelint + Prettier.
- `bun run check` validates format + lint.
- `bun run format` auto-fixes.
- `bun run build` validates full build.
- Stylelint: BEM class patterns, alphabetical CSS properties, string imports.

## Tests

- Vitest + `vitest-browser-svelte` with Playwright provider.
- Component tests live beside components (`*.svelte.{test,spec}.{js,ts}`).
- Plain `.{test,spec}.{js,ts}` files run in Node (utils, runes, server logic).

## Related Skills

| Area                 | Skill         |
| -------------------- | ------------- |
| UI implementation    | Load `style`  |
| Staging + committing | Load `commit` |
| Creating PRs         | Load `pr`     |
