---
trigger: always_on
---

# Architecture

## Intent

Maintain a scalable and predictable monorepo structure using Turborepo and feature-based isolation.

## Tech Stack

- **Monorepo**: Turborepo
- **Package Manager**: Bun
- **Frontend**: SvelteKit (v5 Runes)
- **3D Engine**: Threlte / Three.js
- **CMS**: Sanity (apps/studio)
- **Animations**: GSAP (GreenSock)
- **Styling**: Custom BEM CSS (Tailwind v4 as foundation layer, rarely used directly)
- **WebGL Shaders**: @paper-design/shaders + custom GLSL
- **Analytics**: OpenPanel (@openpanel/web)
- **Deploy**: Cloudflare Pages (adapter-cloudflare + wrangler)
- **Testing**: Vitest + Playwright
- **Tooling**: ESLint, Stylelint, Prettier, TypeScript

## Project Tree

```text
.
├── apps/
│   ├── studio/              # Sanity CMS management
│   └── web/                 # SvelteKit + Threlte frontend
│       ├── src/
│       │   ├── lib/
│       │   │   ├── analytics/   # OpenPanel tracking
│       │   │   ├── assets/      # Fonts, images, SVGs
│       │   │   ├── components/  # Feature-based components (Header/, Info/, Poster/, Shaders/)
│       │   │   ├── layouts/     # Page-level layout components
│       │   │   ├── shaders/     # GLSL shader modules (gem-smoke, preview-reveal*)
│       │   │   ├── state/       # Svelte 5 runes ($state)
│       │   │   ├── types/       # TypeScript type definitions
│       │   │   ├── utils/       # Utility functions (glitch, splitText, stageScale, tiles)
│       │   │   └── styles/      # Design tokens (BEM/CSS Variables) — base/, layout/, utilities/
│       │   └── routes/          # SvelteKit routing
│       │       ├── api/         # API endpoints
│       │       └── shaders/     # Shader demo routes
├── packages/
│   ├── eslint-config/     # Shared linting rules
│   ├── stylelint-config/  # Shared CSS styling rules
│   └── typescript-config/ # Shared TS configurations
├── .agents/               # Agent skills, rules, and workflows
├── .github/workflows/     # CI: build + lint + commitlint
├── turbo.json             # Turborepo pipeline config
└── package.json           # Root dependencies and workspace scripts
```

## Rules

- MUST follow the monorepo structure above.
- MUST use feature-based subdirectories within `lib/components/` for component grouping.
- MUST NOT import across feature groups directly; use a public API or bridge.
- MUST isolate business logic/state from the UI components.

## Guidelines

- Prefer modular and composable design.
- Keep shared logic in `packages/` if used by multiple apps.
- Use Sanity for content-driven data and Svelte for presentation.
- State management uses Svelte 5 `$state` runes (not stores).

## Checks

- No circular dependencies between packages.
- Clear separation between UI and Data Fetching logic.

## Anti-patterns

- Shared global state without boundaries.
- Logic inside Svelte components that should be in a $state rune or utility.
- Hardcoding content that should be in Sanity.
