---
name: pr
description: File a concise pull request. Use when the user asks to file, open, or create a PR.
---

## Pull Request Workflow

### 1. Pre-flight

- Check whether a PR already exists: `gh pr view --json number,title,state`
  plus `gh pr list --head <branch>`. Edit it instead of opening a duplicate.
- Review the diff locally against `origin/main` (`git diff origin/main...HEAD --stat`
  plus full diff) to make sure its contents match the goal. Drop stray files,
  never stage `.agents/`.
- Skim recent git history (`git log --oneline -15`) for title conventions.

### 2. Title

PR titles usually become squash messages, so keep the repo's one-line
conventional format (`<type>(<scope>): <description>`, max 120 chars,
`&` for correlated details, `+` for distinct ones). Within that format,
explain why the change matters, not just what moved.

- BAD (what-only): `refactor(web): move poster routes into app group`
- GOOD (why): `feat(web): cut work navigation to one click with shader layout + split poster info views`
- BAD (what-only): `fix(web): negotiate create param on the works route`
- GOOD (why): `fix(web): stop preview modal reopening on refresh with intent store`

### 3. Description

Open with a simple explanation of the problem based on the user's original
prompt, then briefly explain the solution. Do not lead with an
implementation inventory.

- BAD: `Removed implicit parent requirement from CreateWorkSchema, deleted the
preview insert from the orphan branch, moved 8 routes into (app)/...`
- GOOD: `Creating a quick work entry always forced a preview pick, and everything
lived under one crowded page. Works can now exist previewless, and
poster/info get their own focused views behind a shader layout.`

Then keep the rest compact. Draft the body to a temp `.md` file (avoids
shell escaping with backticks) and use asterisks for bullet lists.
MUST include:

- `### Summary`: problem plus outcome in 2-4 sentences (the GOOD paragraph above).
- `### Changes`: compact table (`| File | Change |`) or short bullets,
  only what a reviewer needs.
- `### Verification`: validation steps and results (`bun run check`,
  `bun run build`, plus manual checks).
- `### Harness`: model plus harness that filed the PR.
- `### Configuration`: only when the PR itself requires setup (new env vars,
  scripts, deps). Omit otherwise.

### 4. File it

- Create: `gh pr create --title "<title>" --body-file <path/to/pr_body.md>`
- Edit: `gh pr edit <number> --body-file <path/to/pr_body.md>`
- Open a real PR rather than a draft so review bots run.
- Automated gates: GitHub Actions validates the title (commitlint) and the
  CI pipeline (`build`, `lint`, `format`) must stay green before merge.

## Review Comment Handling

When Copilot or other reviewers leave feedback on a PR:

- Evaluate each comment: address valid concerns (bugs, memory leaks,
  duplication) and acknowledge false positives.
- Push fixes as separate, focused commits (one concern per commit where practical).
- Post a summary comment on the PR listing what was addressed and how.
