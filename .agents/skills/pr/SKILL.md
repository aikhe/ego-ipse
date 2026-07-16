---
name: pr
description: Pull request creation with structured descriptions and verification
---

## Pull Request Workflow

1. **Check the branch** — verify with `git status` and `git branch -a` that the branch is pushed to remote.

2. **Draft the PR body as a markdown file** — write the body to a `.md` temp file (e.g. `pr_body.md`). This avoids shell escaping issues with backticks and inline code when passing to `gh`.

3. **Create or edit the PR using the file**
   - Create: `gh pr create --title "<title>" --body-file <path/to/pr_body.md>`
   - Edit: `gh pr edit <number> --body-file <path/to/pr_body.md>`

4. **PR Title** follows the conventional commit format (`<type>(<scope>): <description>`).

5. **PR Description** MUST NOT use hyphens anywhere in the body. Use asterisks for bullet lists instead. MUST include:
   - `### Summary`: High-level overview.
   - `### Features`: Bulleted list of new functionality.
   - `### Changes`: Table format (`| File | Change |`) with technical breakdown.
   - `### Verification`: Validation steps and results (e.g. lint, typecheck, build, review comments addressed).
   - `### Configuration`: (If applicable) code snippets for setup.

## Review Comment Handling

When Copilot or other reviewers leave feedback on a PR:

- Evaluate each comment — address valid concerns (bugs, memory leaks, duplication) and acknowledge false positives.
- Push fixes as separate, focused commits (one concern per commit where practical).
- Post a summary comment on the PR listing what was addressed and how.
