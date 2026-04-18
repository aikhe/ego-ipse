# Agentic Coding Guide

This repository already has a local agent system under `.agents/`. Use this file as the root entrypoint for coding agents so the setup is discoverable from the workspace root.

## Source Of Truth

- Rules: `.agents/rules/*.md`
- Skills: `.agents/skills/*/SKILL.md`
- Workflows: `.agents/workflows/*.md`

## Recommended Load Order

1. Read `.agents/rules/project-context.md` for product context.
2. Read `.agents/rules/architecture.md` for repo structure and boundaries.
3. Read `.agents/rules/development-standards.md` for coding and UI standards.
4. Read `.agents/rules/ui-system.md` when touching UI, motion, or styling.
5. Read `.agents/rules/git-policy.md` when preparing commits or PRs.
6. Read the relevant skill file before doing work in that domain.
7. Follow the matching workflow file before finalizing changes.

## Skill Map

- `design`: Svelte UI, BEM CSS, tokens, GSAP motion.
- `tests`: unit tests, component tests, e2e checks.
- `sync`: Sanity schema and frontend data synchronization.
- `git`: commit and PR formatting.
- `caveman`: ultra-brief responses when requested.

## Workflow Map

- `format-and-lint-workflow.md`: run repo checks and fix diagnostics.
- `done-criteria.md`: final quality gate before handoff.
- `commit-convention.md`: commit message rules and commit flow.
- `pr-workflow.md`: PR-ready summary and change log format.

## Repository Expectations

- Keep changes within the monorepo structure under `apps/` and `packages/`.
- Use `bun run check` for validation and `bun run build` for final verification when code changes.
- Do not commit unless the user explicitly asks.
- Do not stage or commit the `.agents` directory itself.
- Prefer root-cause fixes over superficial patches.
- Keep UI work aligned with the premium visual system and BEM naming conventions.

## Tooling Notes

- The repo uses Bun, Turborepo, SvelteKit, and Sanity.
- CI runs `bun run check` and `bun run build`.
- Commit messages are validated by Commitlint in CI and by Husky locally.

## Practical Setup For New Agents

When introducing another agent or automation layer, mirror these files in the tool's preferred location:

- Put workspace-level instructions in a root `AGENTS.md` or equivalent.
- Keep detailed rules in `.agents/rules/`.
- Keep reusable task playbooks in `.agents/workflows/`.
- Keep domain-specific guidance in `.agents/skills/<skill>/SKILL.md`.

If a tool supports only one instruction file, keep this file concise and use the `.agents/` tree as the detailed source of truth.
