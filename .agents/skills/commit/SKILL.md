---
name: commit
description: File a clean commit. Use when the user asks to commit or save work.
---

# Commit Changes

Stage and commit changes using the professional, structured Git commit message format.

## Commit Message Format

Follow the conventional commits standard with specific style guidelines:

- Format: `<type>(<scope>): <description 1> & <description 2> + <description 3>` (or similar compact structure using `&` and `+` to chain related changes)
- Wrap long messages immediately after a `+` or `&` (max 120 chars).
- Commit messages are enforced in CI by commitlint: keep them single-line.
- Examples:
  - `refactor(web): compact typography classes & shared button primitives + migrate shared text styles`
  - `feat(plugins): integrate wrapped.nvim & update cake/fleur commands + define custom keymaps`
  - `refactor(config): tidy up theme/cord integration & optimize core plugin settings + enable termguicolors`
