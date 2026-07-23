---
trigger: model_decision
description: Established rules for technical one-line commits and structured PR documentation. Apply this rule when staging changes, creating commits, or preparing pull requests.
---

# Git Policy

Established rules for technical one-line commits, PowerShell usage, and structured PR documentation. Apply this rule when staging changes, creating commits, or preparing pull requests.

## Intent

Maintain a clean, technical, and descriptive commit/PR history following a strict one-line and structured format, enforced by automated tooling.

## Rules

- MUST ONLY commit when explicitly instructed by the USER.
- MUST NOT stage or commit the `.agents` directory.
- MUST use a single-line commit message format (enforced by Commitlint).
- MUST NOT include "Summary:" or any multi-line descriptions in commits.
- MUST use `+` to connect distinct features/changes.
- MUST use `&` to connect correlated details within a change.
- MUST wrap long messages immediately after a `+` or `&` (Max 120 chars).

## Automated Enforcement

- **Remote**: GitHub Actions validates PR titles and runs the CI pipeline (`build`, `lint`, `format`).
- **CI**: Commitlint validates commit messages.

## Pull Request Style

- When requested, provide PR content as markdown that can be copied/pasted.
- PR Titles MUST follow the commit style (one-line, technical).
- PR Descriptions MUST include:
  - `### Summary`: High-level overview.
  - `### Features`: Bulleted list of new functionality.
  - `### Changes`: Technical breakdown of changes.
  - `### Verification`: Validation steps and results (lint, typecheck, build, review comments addressed).
  - `### Configuration`: (If applicable) code snippets for setup.

## Guidelines

- Make commit messages technical and descriptive.
- Prefer `feat(scope):`, `fix(scope):`, etc.
- Use lowercase for simple, direct descriptions.
- Use PowerShell for all Git operations.

## Samples

- `feat(threlte): scene interactions & perspective + load gltf model init`
- `fix(svelte): resolve each_key_duplicate error & refine dark mode overlay colors`

### PR Description Example

````markdown
### Summary

Integrates the gem-smoke WebGL shader as a full-screen background effect with
a new "shader" layout mode, theme-reactive colors, and extracted layout
components — cleaning up the root layout significantly.

### Features

- **Shader layout mode**: Toggle between `layered` (3D poster scene) and
  `shader` (gem-smoke WebGL background) modes via `Shift+L`, `Shift+F`, or
  the header button. `shader` is now the default layout.
- **Theme-reactive shader**: Gem-smoke colors, inner glow, and outer glow
  intensity adapt to light/dark theme automatically.
- **Instant toggle**: Canvas stays mounted — toggling is a CSS-only
  operation with no WebGL context recreation.
- **Transparent background**: Shader background alpha = 0, allowing grid
  lines and page background to show through.

### Changes

- **Layout extraction**: `ShaderLayout`, `SceneLayout`, `GridBackground`,
  `GridOverlay`, `StripeGutter` components under `src/lib/layouts/`
- **Root layout**: 295 → 150 lines; inline blocks replaced with components
- **Homepage**: 92 → 62 lines; inline Canvas/Scene replaced with SceneLayout
- **State**: LayoutMode default changed to `'shader'`
- **Stacking**: Shader at z-index -50, hero at z-index 3

### Configuration

```ts
// apps/web/src/lib/state/ui.svelte.ts
export type LayoutMode = 'layered' | 'shader';
layoutMode: 'shader' as LayoutMode;
```
````

```

## Anti-patterns

- Committing without explicit "go ahead" from the USER.
- Using multi-line commit messages with summaries.
- Merging PRs with failing CI checks (Red ❌).
```
