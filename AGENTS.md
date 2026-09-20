# Ego Ipse

Project: **Ego Ipse**: portfolio + identity platform.
Stack: Bun, Turborepo, SvelteKit 5, Threlte/Three.js, Sanity, GSAP, BEM CSS, Cloudflare Pages.

## Entry Point

Read `.agents/rules/` for context before making changes.

## Rules (`rules/`)

| File                       | When                                 |
| -------------------------- | ------------------------------------ |
| `project-context.md`       | First — product context, premium bar |
| `architecture.md`          | Repo structure, package boundaries   |
| `development-standards.md` | Coding conventions, lint, types      |
| `ui-system.md`             | UI, motion, styling                  |
| `git-policy.md`            | Commits, PRs                         |

## Skills (`skills/`)

| Skill      | Use when                              |
| ---------- | ------------------------------------- |
| `style`    | Styling components, BEM, GSAP, tokens |
| `webp`     | Work preview images                   |
| `commit`   | Staging + committing changes          |
| `pr`       | Creating PRs                          |
| `grill-me` | Stress-testing a plan or design       |

## Expectations

- Changes live under `apps/` and `packages/`.
- Validate: `bun run check && bun run build`.
- Don't commit unless instructed.
- Don't stage `.agents/`.
- Root-cause fixes over patches.
