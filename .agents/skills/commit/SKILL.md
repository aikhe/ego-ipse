---
name: commit
description: 'Commit staged or unstaged changes with a structured, professional format'
argument-hint: '[arguments]'
allowed-tools: ['Bash', 'Read', 'Task', 'run_shell_command']
---

# Commit Changes

Stage and commit changes using the professional, structured Git commit message format.

## Commit Message Format

Follow the conventional commits standard with specific style guidelines:

- Format: `<type>(<scope>): <description 1> & <description 2> + <description 3>` (or similar compact structure using `&` and `+` to chain related changes)
- Examples:
  - `refactor(web): compact typography classes & shared button primitives + migrate shared text styles`
  - `feat(plugins): integrate wrapped.nvim & update cake/fleur commands + define custom keymaps`
  - `refactor(config): tidy up theme/cord integration & optimize core plugin settings + enable termguicolors`

## Workflow:

1. **Check Git Status & Diffs**
   - Identify what changes have been made (staged and unstaged).
   - If no changes are staged, stage the relevant changes or ask the user.

2. **Draft the Commit Message**
   - Analyze the diffs.
   - Write a clear, concise commit message following the exact format above.
   - Use standard conventional commit types (e.g., `feat`, `refactor`, `fix`, `chore`, `docs`, `style`, etc.).

3. **Execute the Commit**
   - Run the git commit command to commit the changes.

## Pull Request Workflow

1. **Check that the branch is pushed** — verify with `git status` and `git branch -a`.

2. **Draft the PR body as a markdown file** — write the body to a `.md` temp file (e.g. `pr_body.md`). This avoids shell escaping issues with backticks and inline code when passing to `gh`.

3. **Create or edit the PR using the file**
   - Create: `gh pr create --title "<title>" --body-file <path/to/pr_body.md>`
   - Edit: `gh pr edit <number> --body-file <path/to/pr_body.md>`

4. **PR Title** follows the same format as commit messages.

5. **PR Description** MUST include:
   - `### Summary`: High-level overview.
   - `### Features`: Bulleted list of new functionality.
   - `### Changes`: Technical breakdown of changes.
   - `### Configuration`: (If applicable) code snippets for setup.
