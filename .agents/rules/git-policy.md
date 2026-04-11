---
trigger: model_decision
description: Established rules for technical one-line commits, PowerShell usage, and structured PR documentation. Apply this rule when staging changes, creating commits, or preparing pull requests.
---

# Git Policy

Established rules for technical one-line commits, PowerShell usage, and structured PR documentation. Apply this rule when staging changes, creating commits, or preparing pull requests.

## Intent

Maintain a clean, technical, and descriptive commit/PR history following a strict one-line and structured format, enforced by automated tooling.

## Rules

- MUST ONLY commit when explicitly instructed by the USER.
- MUST NOT stage or commit the `.agent` directory.
- MUST use a single-line commit message format (enforced by Commitlint).
- MUST NOT include "Summary:" or any multi-line descriptions in commits.
- MUST use `+` to connect distinct features/changes.
- MUST use `&` to connect correlated details within a change.
- MUST wrap long messages immediately after a `+` or `&` (Max 120 chars).

## Automated Enforcement

- **Local**: Husky prevents non-compliant commits via a `commit-msg` hook.
- **Remote**: GitHub Actions validates PR titles and runs the CI pipeline (`build`, `lint`, `format`).

## Pull Request Style

- When requested, provide PR content as markdown that can be copied/pasted.
- PR Titles MUST follow the commit style (one-line, technical).
- PR Descriptions MUST include:
  - `### Summary`: High-level overview.
  - `### Features`: Bulleted list of new functionality.
  - `### Changes`: Technical breakdown of modified files with [clickable links].
  - `### Configuration`: (If applicable) code snippets for setup.

## Guidelines

- Make commit messages technical and descriptive.
- Prefer `feat(scope):`, `fix(scope):`, etc.
- Use lowercase for simple, direct descriptions.
- Use PowerShell for all Git operations.

## Samples

- `feat(threlte): scene interactions & perspective + load gltf model init`
- `fix(svelte): resolve each_key_duplicate error & refine dark mode overlay colors`

## Anti-patterns

- Committing without explicit "go ahead" from the USER.
- Using multi-line commit messages with summaries.
- Staging the `.agent` folder.
- Merging PRs with failing CI checks (Red ❌).
