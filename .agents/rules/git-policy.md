---
trigger: model_decision
description: Git guards for commits and PRs. Applies when staging, committing, or filing PRs.
---

# Git Policy

## Rules

- MUST ONLY commit when explicitly instructed by the USER.
- MUST NOT stage or commit the `.agents` directory.
- Use PowerShell for all Git operations.

## Related Skills

| Area                                     | Skill         |
| ---------------------------------------- | ------------- |
| Staging + committing code                | Load `commit` |
| PR creation with structured descriptions | Load `pr`     |
