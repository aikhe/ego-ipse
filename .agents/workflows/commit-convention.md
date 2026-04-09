---
description: Standardizes technical one-line commit messages using project-specific connection logic (+ and &) for a clean repository history.
---

# Commit Convention Workflow

**Description**: Standardizes technical one-line commit messages using project-specific connection logic (+ and &) for a clean repository history.

**Brief Description**: A streamlined protocol for crafting concise, consistent, and descriptive commit messages that maintain repository readability.

## Steps

1. **Verify Task Completion**: Before drafting a message, ensure the requested changes are fully implemented and verified according to the project's /done-criteria.
2. **Review Logic**: Confirm the code follows the KISS (Keep It Simple, Stupid) and DRY (Don't Repeat Yourself) methods. Remove any bloated logic or unnecessary edge cases.
3. **Construct Message**:
    - Use the technical one-line format.
    - Start with `feat(scope):` or `fix(scope):` in lowercase.
    - Use `+` to connect distinct features (e.g., `feat: logo inversion + theme toggle loop`).
    - Use `&` to connect correlated details (e.g., `fix(svelte): key duplicate & z-index layering`).
4. **Validation**: Check that the message does not contain a "Summary:" block or multi-line text.
5. **Final Confirmation**: Present the proposed `git commit -m` command and wait for the user's "go ahead" before execution.
